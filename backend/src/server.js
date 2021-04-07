const createApp = require('./app');

const config = require('./config.js');

const app = createApp();

const server = app.listen(
    config.get('port'),
    () => {
        console.log(`Server listening on port: ${config.get('port')}`);
    }
);

module.exports = server;
