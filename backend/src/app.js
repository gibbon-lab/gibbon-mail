const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const Sentry = require('@sentry/node');
const Koa = require('koa');
const koaStatic = require('koa-static');
const cors = require('@koa/cors');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { koaSwagger } = require('koa2-swagger-ui');

const mjml2html = require('mjml');
const nunjucks = require('nunjucks');
const nodemailer = require('nodemailer');

const readFile = promisify(fs.readFile);
const router = new Router();

const { validateSchema } = require('./validate');
const config = require('./config.js');

const {
    getSmtpUrl,
    getSmtp2Url,
    overrideConsoleErrorToAddSentryCapture
} = require('./utils');

const nunjucksEnv = new nunjucks.Environment();

if (config.get('sentryDSN')) {
    console.log('Sentry enabled');
    Sentry.init({
        dsn: config.get('sentryDSN'),
        release: config.get('sentryRelease'),
        attachStacktrace: true,
        normalizeDepth: 11,
        environment: config.get('sentryEnvironment')
    });

    overrideConsoleErrorToAddSentryCapture();
}

router.get('/v1/', (ctx) => {
    ctx.body = {
        version: '0.1.0'
    };
});

router.get('/v1/swagger.yaml', (ctx) => {
    ctx.type = 'text/yaml';
    ctx.body = fs.createReadStream(path.join(__dirname, 'swagger.yaml'));
});

router.get('/v1/templates/', (ctx) => {
    ctx.body = fs.readdirSync(
        config.get('template_path'), { withFileTypes: true }
    )
        .filter(((f) => !f.isFile()))
        .map((f) => f.name);
});

router.get('/v1/smtp/', (ctx) => {
    ctx.body = {
        'smtp1': config.get('smtp')
    };
    if (getSmtp2Url()) {
        ctx.body['smtp2'] = config.get('smtp2');
    }
});

router.get('/v1/templates/:name', (ctx) => {
    const schemaJsonPath = path.join(
        config.get('template_path'),
        ctx.params.name,
        'schema.json'
    );
    if (!fs.existsSync(schemaJsonPath)) {
        ctx.status = 404;
        ctx.body = `Template ${ctx.params.name} not exists`;
        return;
    }
    const jsonSchemaStr = fs.readFileSync(
        schemaJsonPath,
        {
            encoding: 'utf8'
        }
    );

    let jsonSchema;

    try {
        jsonSchema = JSON.parse(jsonSchemaStr);
    } catch (e) {
        ctx.status = 500;
        ctx.body = e;
        return;
    }

    let readme;
    const readmeTemplatePath = path.join(config.get('template_path'), ctx.params.name, 'README.md');
    if (fs.existsSync(readmeTemplatePath)) {
        readme = getReadme(readmeTemplatePath);
    }

    ctx.body = {
        readme,
        json_schema: jsonSchema
    };
});

function getReadme(templatePath) {
    return fs.readFileSync(
        templatePath,
        {
            encoding: 'utf8'
        }
    );
}

function getSubject(templatePath, values) {
    return nunjucksEnv.renderString(
        fs.readFileSync(
            templatePath,
            {
                encoding: 'utf8'
            }
        ),
        values
    );
}

function getHtml(templatePath, values) {
    return mjml2html(
        nunjucksEnv.renderString(
            fs.readFileSync(
                templatePath,
                {
                    encoding: 'utf8'
                }
            ),
            values
        )
    ).html;
}

function replaceAllCIDByPreviewUrl(data, ctx) {
    return data.replace(/(['|"])cid:(.*)(['|"])/gi, `$1${config.get('site_url')}/v1/templates/${ctx.params.name}/attachments/$2$3`);
}

function getTxt(templatePath, values) {
    return nunjucksEnv.renderString(
        fs.readFileSync(
            templatePath,
            {
                encoding: 'utf8'
            }
        ),
        values
    );
}

router.post('/v1/templates/:name/preview', (ctx) => {
    const templatePath = path.join(config.get('template_path'), ctx.params.name);

    let subjectTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.subject`);
    let mjmlTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.mjml`);
    let txtTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.txt`);

    if (
        ctx.request.body.lang && (
            !fs.existsSync(subjectTemplatePath) ||
            !fs.existsSync(mjmlTemplatePath) ||
            !fs.existsSync(txtTemplatePath)
        )
    ) {
        Sentry.withScope((scope) => {
            scope.setContext('request', ctx.request);
            console.error(new Error(`Can't find all "${ctx.request.body.lang}" files for this template, fallbacking to default language`));
        });
        subjectTemplatePath = path.join(templatePath, 'default.subject');
        mjmlTemplatePath = path.join(templatePath, 'default.mjml');
        txtTemplatePath = path.join(templatePath, 'default.txt');
    }

    const templates = [subjectTemplatePath, mjmlTemplatePath, txtTemplatePath];

    for (let i = 0; i < templates.length; i++) {
        if (!fs.existsSync(templates[i])) {
            ctx.status = 404;
            ctx.body = `Template ${templates[i]} not exists`;
            return;
        }
    }

    ctx.type = 'application/json';
    ctx.body = {
        'subject': getSubject(subjectTemplatePath, ctx.request.body),
        'html': replaceAllCIDByPreviewUrl(
            getHtml(mjmlTemplatePath, ctx.request.body),
            ctx
        ),
        'txt': getTxt(txtTemplatePath, ctx.request.body)
    };
});

router.post('/v1/templates/:name/send/:stmpSelected?', async (ctx) => {
    const templatePath = path.join(config.get('template_path'), ctx.params.name);

    if (ctx.params.stmpSelected === undefined) {
        ctx.params.stmpSelected = 'smtp1';
    }

    let subjectTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.subject`);
    let mjmlTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.mjml`);
    let txtTemplatePath = path.join(templatePath, `${ctx.request.body.lang || 'default'}.txt`);
    let jsonSchemaPath = path.join(templatePath, 'schema.json');
    const attachmentsPath = path.join(
        config.get('template_path'),
        ctx.params.name,
        'attachments'
    );

    if (
        ctx.request.body.lang && (
            !fs.existsSync(subjectTemplatePath) ||
            !fs.existsSync(mjmlTemplatePath) ||
            !fs.existsSync(txtTemplatePath)
        )
    ) {
        Sentry.withScope((scope) => {
            scope.setContext('request', ctx.request);
            console.error(new Error(`Can't find all "${ctx.request.body.lang}" files for this template, fallbacking to default language`));
        });
        subjectTemplatePath = path.join(templatePath, 'default.subject');
        mjmlTemplatePath = path.join(templatePath, 'default.mjml');
        txtTemplatePath = path.join(templatePath, 'default.txt');
    }

    const templates = [
        subjectTemplatePath,
        mjmlTemplatePath,
        txtTemplatePath,
        jsonSchemaPath
    ];

    for (let i = 0; i < templates.length; i++) {
        if (!fs.existsSync(templates[i])) {
            ctx.status = 404;
            ctx.body = `Template ${templates[i]} not exists`;
            return;
        }
    }

    try {
        await validateSchema(jsonSchemaPath, ctx.request.body);
    } catch (error) {
        Sentry.withScope((scope) => {
            scope.setContext('request', ctx.request);
            console.error(error);
        });
    }

    const attachments = [];
    if (fs.existsSync(attachmentsPath)) {
        const attachmentsFiles = fs.readdirSync(attachmentsPath);
        if (Array.isArray(attachmentsFiles) && attachmentsFiles.length > 0) {
            attachmentsFiles.forEach((filename) => {
                attachments.push({
                    filename: filename,
                    path: path.join(
                        config.get('template_path'),
                        ctx.params.name,
                        'attachments',
                        filename
                    ),
                    cid: filename,
                    encoding: 'base64'
                });
            });
        }
    }

    const result = await ctx.transporter[ctx.params.stmpSelected].sendMail({
        from: ctx.request.body.from,
        to: ctx.request.body.to,
        bcc: Array.isArray(ctx.request.body.bcc)
            ? config.get('bcc').concat(ctx.request.body.bcc)
            : typeof ctx.request.body.bcc === 'string'
                ? [...config.get('bcc'), ctx.request.body.bcc]
                : config.get('bcc'),
        subject: getSubject(subjectTemplatePath, ctx.request.body),
        html: getHtml(mjmlTemplatePath, ctx.request.body),
        text: getTxt(txtTemplatePath, ctx.request.body),
        attachments: attachments
    });
    ctx.body = { result: result };
});

router.get('/v1/templates/:name/attachments/:filename', async (ctx) => {
    const attachmentFilePath = path.join(
        config.get('template_path'),
        ctx.params.name,
        'attachments',
        ctx.params.filename
    );
    if (!fs.existsSync(attachmentFilePath)) {
        ctx.status = 404;
        ctx.body = `${ctx.params.name}/attachments/${ctx.params.filename} file not exists`;
        return;
    }

    ctx.attachment(ctx.params.filename);
    ctx.body = fs.createReadStream(attachmentFilePath);
});

module.exports = {
    createApp: function createApp() {
        const app = new Koa();

        app.context.transporter = {};
        if (getSmtpUrl() === undefined) {
            app.context.transporter['smtp1'] = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix'
            });
        } else {
            app.context.transporter['smtp1'] = nodemailer.createTransport(getSmtpUrl());
            app.context.transporter['smtp1'].verify(function (error) {
                if (error) {
                    console.error(error);
                    console.error('Smtp url:', getSmtpUrl());
                    process.exit(1);
                } else {
                    console.log('Smtp server is ready to take our messages');
                }
            });
        }

        if (getSmtp2Url() !== undefined) {
            app.context.transporter['smtp2'] = nodemailer.createTransport(getSmtp2Url());
            app.context.transporter['smtp2'].verify(function (error) {
                if (error) {
                    console.error(error);
                    console.error('Smtp2 url:', getSmtp2Url());
                    process.exit(1);
                } else {
                    console.log('Smtp server 2 is ready to take our messages');
                }
            });
        }

        app.use(bodyParser());
        app.use(cors());
        app.use(router.routes());
        app.use(
            koaSwagger({
                routePrefix: '/docs/',
                swaggerOptions: {
                    url: '/v1/swagger.yaml'
                },
                hideTopbar: true
            })
        );

        let staticPath = undefined;
        if (!(require.main === module)) { // If package is used as dependency
            staticPath = path.join(__dirname, '../front/');
        } else if (config.get('static_path')) {
            staticPath = config.get('static_path');
        }

        if (staticPath) {
            app.use(koaStatic(staticPath));
            app.use(async (ctx, next) => {
                ctx.type = 'html';
                ctx.body = await readFile(`${staticPath}/index.html`);
                await next();
            });
        }

        return app;
    },
    nunjucksEnv
};
