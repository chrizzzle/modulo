const env = require('./env-config.js');

module.exports = {
    presets: [
        'latest',
        'next/babel',
        'es2015',
        'env',
        '@zeit/next-typescript/babel'
    ],
    plugins: [
        'syntax-async-functions',
        ['transform-define', env]
    ]
};
