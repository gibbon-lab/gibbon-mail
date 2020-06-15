const createApp = require('./app');

const PORT = process.env.PORT || 5000;

const app = createApp({
    port: PORT,
    templatePath: process.env.TEMPLATES_PATH || '../mail-templates/',
    staticPath: process.env.STATIC_PATH || undefined,
    smtpUrl: process.env.SMTP_URL || undefined,
    siteUrl: process.env.SITE_URL || `http://127.0.0.1:${PORT}`,
    archivePath: process.env.GIBBON_MAIL_ARCHIVE_PATH || undefined
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
