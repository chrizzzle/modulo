'use strict';

const Archetype = require('archetype-js');
const UserType = require('./user');
const { ObjectId } = require('mongodb');
const express = require('express');

module.exports = () => {
    const router = express.Router();

    const wrapAsync = handler => (req, res) => handler(req)
        .then(result => res.json(result))
        .catch(error => res.status(500).json({ error: error.message }));

    router.get('/version', wrapAsync(async function() {
        return {version: "1.0.0"};
    }));

    return router;
};
