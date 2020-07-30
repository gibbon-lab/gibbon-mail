const Convict = require('convict');

const config = Convict({
    port: {
        doc: 'Backend listen http port',
        format: Number,
        default: 5000,
        env: 'PORT'
    },
    template_path: {
        doc: 'Path to mail templates',
        format: String,
        default: '../mail-templates/',
        env: 'TEMPLATES_PATH'
    },
    static_path: {
        doc: 'Path to static html to expose to http, on production, it is path to gibbon-mail frontend dist files',
        format: String,
        default: undefined,
        env: 'STATIC_PATH'
    },
    smtp_url: {
        doc: 'Stmp server url used to send emails (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
        format: String,
        default: undefined,
        env: 'SMTP_URL'
    },
    site_url: {
        doc: 'The url where is exposed gibbon-mail backend',
        format: String,
        default: 'http://127.0.0.1:${PORT}',
        env: 'SITE_URL'
    }
});

config.validate({ allowed: 'strict' });

module.exports = config;
