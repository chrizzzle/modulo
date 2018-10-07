const prod = process.env.NODE_ENV === 'production';

module.exports = {
    'process.env.API_BASE': prod
        ? 'https://modulo-app.now.sh'
        : 'http://localhost:3000',
    'process.env.MONGO_USER': '@mongouser',
    'process.env.MONGO_PASS': '@mongopass',
    'process.env.MONGO_NAME': '@mongoname'
};
