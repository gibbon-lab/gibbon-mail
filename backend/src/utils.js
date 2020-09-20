const getSmtpUrl = (config) => {
    if (
        config.get('smtp.username') &&
        config.get('smtp.password') &&
        config.get('smtp.host') &&
        config.get('smtp.port')
    ) {
        return `smtp://${encodeURI(config.get('smtp.username'))}:${encodeURI(config.get('smtp.password'))}@${encodeURI(config.get('smtp.host'))}:${config.get('smtp.port')}/${config.get('smtp.options')}`;
    }
};

const getSmtp2Url = (config) => {
    if (
        config.get('smtp2.username') &&
        config.get('smtp2.password') &&
        config.get('smtp2.host') &&
        config.get('smtp2.port')
    ) {
        return `smtp://${encodeURI(config.get('smtp2.username'))}:${encodeURI(config.get('smtp2.password'))}@${encodeURI(config.get('smtp2.host'))}:${config.get('smtp2.port')}/${config.get('smtp2.options')}`;
    }
};

module.exports = {
    getSmtpUrl,
    getSmtp2Url
};
