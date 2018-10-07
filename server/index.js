const { MongoClient } = require('mongodb');
const api = require('./lib/api');
const body = require('body-parser');
const co = require('co');
const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const MONGO_URL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ds123963.mlab.com:23963/${process.env.MONGO_NAME}`;
const PORT = 3000;

co(function * () {
    // Initialize the Next.js app
    yield app.prepare();

    const client = yield MongoClient.connect(MONGO_URL);
    const db = client.db('modulo');

    // Configure express to expose a REST API
    const server = express();
    server.use(body.json());
    server.use((req, res, next) => {
        // Also expose the MongoDB database handle so Next.js can access it.
        req.db = db;
        next();
    });
    server.use('/api', api(db));

    // Everything that isn't '/api' gets passed along to Next.js
    server.get('*', (req, res) => {
        return handle(req, res)
    });

    server.listen(PORT);
}).catch(error => console.error(error.stack));
