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
    sentryDSN: {
        doc: 'Sentry DSN URL',
        format: String,
        default: '',
        env: 'SENTRY_DSN'
    },
    sentryEnvironment: {
        doc: 'Sentry environment name',
        format: String,
        default: 'unknown',
        env: 'SENTRY_ENVIRONMENT'
    },
    sentryRelease: {
        doc: 'Sentry release',
        format: String,
        default: '',
        env: 'SENTRY_RELEASE'
    },
    smtp: {
        username: {
            doc: 'Stmp username used for authentification (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_USERNAME'
        },
        password: {
            doc: 'Stmp password used for authentification (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_PASSWORD'
        },
        host: {
            doc: 'Stmp host of the server (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_HOST'
        },
        port: {
            doc: 'Smtp port of the server (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_PORT'
        },
        options: {
            doc: 'Stmp options (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_OPTIONS'
        },
        label: {
            doc: 'Stmp server label (for instance Mailchimp SMTP server)',
            format: String,
            default: 'Default SMTP',
            env: 'SMTP_LABEL'
        }
    },
    smtp2: {
        username: {
            doc: 'Stmp username used for authentification (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP2_USERNAME'
        },
        password: {
            doc: 'Stmp password used for authentification (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP2_PASSWORD'
        },
        host: {
            doc: 'Stmp host of the server (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP2_HOST'
        },
        port: {
            doc: 'Smtp port of the server (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP2_PORT'
        },
        options: {
            doc: 'Stmp options (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: '?pool=true',
            env: 'SMTP2_OPTIONS'
        },
        label: {
            doc: 'Second stmp server label (for instance Mailchimp SMTP server)',
            format: String,
            default: 'Second SMTP',
            env: 'SMTP2_LABEL'
        }
    },
    site_url: {
        doc: 'The url where is exposed gibbon-mail backend',
        format: String,
        default: 'http://127.0.0.1:${PORT}',
        env: 'SITE_URL'
    },
    bcc: {
        doc: 'Email address to add in bcc field (Blind carbon copy) to all mail sends',
        format: Array,
        default: [],
        env: 'BCC'
    }
});

config.validate({ allowed: 'strict' });

module.exports = config;
