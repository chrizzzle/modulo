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
const http = require('http');



co(function * () {
    yield nextApp.prepare();
    const config = require('./config/config');
    const {typeDefs, resolvers} = require('./lib/schema');

    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        uploads: false,
        subscriptions: {
            path: '/subscriptions',
            onConnect: async (connectionParams, webSocket) => {
                console.log(`Subscription client connected using Apollo server's built-in SubscriptionServer.`)
            }
        }
    });

    const app = express();
    const httpServer = http.createServer(app);
    apolloServer.applyMiddleware({app: app});
    apolloServer.installSubscriptionHandlers(httpServer);


    app.use(body.json());
    app.use((req, res, next) => {
        // Also expose the MongoDB database handle so Next.js can access it.
        next();
    });
    app.use('/api', api());
    app.use(cors());

    httpServer.listen(config.server.port, () => {
        console.log(`Graphql server ready at http://localhost:${config.server.port}${apolloServer.graphqlPath}`)
        console.log(`Graphql subscription server ready at ws://localhost:${config.server.port}${apolloServer.subscriptionsPath}`)
    });

    // Everything that isn't '/api' gets passed along to Next.js
    app.get('*', (req, res) => {
        return handle(req, res)
    });

    app.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}`)
    });

}).catch(error => console.error(error.stack));
