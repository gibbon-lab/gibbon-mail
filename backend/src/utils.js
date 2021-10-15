const Sentry = require('@sentry/node');

const config = require('./config');

const getSmtpUrl = () => {
    if (
        config.get('smtp.username') &&
        config.get('smtp.password') &&
        config.get('smtp.host') &&
        config.get('smtp.port')
    ) {
        return `smtp://${encodeURIComponent(config.get('smtp.username'))}:${encodeURIComponent(config.get('smtp.password'))}@${config.get('smtp.host')}:${config.get('smtp.port')}/${config.get('smtp.options')}`;
    }
};

const getSmtp2Url = () => {
    if (
        config.get('smtp2.username') &&
        config.get('smtp2.password') &&
        config.get('smtp2.host') &&
        config.get('smtp2.port')
    ) {
        return `smtp://${encodeURIComponent(config.get('smtp2.username'))}:${encodeURIComponent(config.get('smtp2.password'))}@${config.get('smtp2.host')}:${config.get('smtp2.port')}/${config.get('smtp2.options')}`;
    }
};

global.oldConsoleError = console.error;
const overrideConsoleErrorToAddSentryCapture = () => {
    if (!('console' in global)) {
        return;
    }
    if (!('error' in global.console)) {
        return;
    }

    console.error = (...args) => {
        Sentry.withScope((scope) => {
            scope.setLevel('error');
            scope.addEventProcessor((event) => {
                event.logger = 'console';
                return event;
            });
            scope.setContext('console arguments', {
                arguments: args
            });

            if (args[0] instanceof Error) {
                Sentry.captureException(args[0]);
            } else {
                Sentry.captureMessage(args[0]);
            }
        });
        global.oldConsoleError(...args);
    };
};

module.exports = {
    getSmtpUrl,
    getSmtp2Url,
    overrideConsoleErrorToAddSentryCapture
};
