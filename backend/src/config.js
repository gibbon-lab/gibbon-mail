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
    smtp: {
        url: {
            doc: 'Stmp server url used to send emails (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP_URL'
        },
        label: {
            doc: 'Stmp server label (for instance Mailchimp SMTP server)',
            format: String,
            default: 'Default SMTP',
            env: 'SMTP_LABEL'
        }
    },
    smtp2: {
        url: {
            doc: 'Second stmp server url used to send emails (for instance: smtp://user:password@127.0.0.1:1025/?pool=true more information https://nodemailer.com/smtp/)',
            format: String,
            default: undefined,
            env: 'SMTP2_URL'
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
        format: String,
        default: undefined,
        env: 'BCC'
    }
});

config.validate({ allowed: 'strict' });

module.exports = config;
