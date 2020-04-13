const createApp = require('./app');

const PORT = process.env.PORT || 5000;

const app = createApp(
    PORT,
    process.env.TEMPLATES_PATH || '../mail-templates/',
    process.env.STATIC_PATH || undefined,
    process.env.SMTP_URL || undefined,
    process.env.SITE_URL || `http://127.0.0.1:${PORT}`
);

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
