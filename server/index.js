const {pubsub} = require('./lib/schema');
const {createServer} = require('http');
const { MongoClient } = require('mongodb');
const api = require('./lib/api');
const body = require('body-parser');
const co = require('co');
const express = require('express');
const next = require('next');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const PORT = 3000;


co(function * () {
    yield nextApp.prepare();
    const config = require('./config/config');
    const {typeDefs, resolvers} = require('./lib/schema');

    const apolloServer =new ApolloServer({ typeDefs, resolvers });

    const app = express();
    const ws = createServer(app);
    apolloServer.applyMiddleware({app: app});

    app.use(body.json());
    app.use((req, res, next) => {
        // Also expose the MongoDB database handle so Next.js can access it.
        next();
    });
    app.use('/api', api());
    app.use(cors());

    app.listen(config.server.port, () => {
        console.log(`🚀 Server ready at http://localhost:${config.server.port}${apolloServer.graphqlPath}`)
    });

    // Everything that isn't '/api' gets passed along to Next.js
    app.get('*', (req, res) => {
        return handle(req, res)
    });

    app.listen(PORT);
}).catch(error => console.error(error.stack));
