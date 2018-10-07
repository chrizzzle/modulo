const withTypescript = require('@zeit/next-typescript');
const withSass = require('@zeit/next-sass');

if (process.env.NODE_ENV !== 'production') {
    require('now-env')
}

module.exports = withTypescript(withSass({
    webpack(config, options) {
        // Perform customizations to webpack config
        // Important: return the modified config
        return config
    },
    webpackDevMiddleware: config => {
        // Perform customizations to webpack dev middleware config
        // Important: return the modified config
        return config
    }
}));
