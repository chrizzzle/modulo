module.exports = {
    db: {
        url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ds123963.mlab.com:23963/${process.env.MONGO_NAME}`,
        name: process.env.MONGO_NAME
    },
    server: {
        port: 3003
    },
    ws: {
        port: 3001
    }
};
