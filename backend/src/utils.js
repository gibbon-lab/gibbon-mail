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

module.exports = {
    getSmtpUrl,
    getSmtp2Url
};
