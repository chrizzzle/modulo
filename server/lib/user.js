'use strict'

const Archetype = require('archetype-js')

module.exports = new Archetype({
    createdAt: {
        $type: Date,
        $default: new Date()
    },
    username: {
        $type: 'string',
        $required: true
    }
}).compile('UserType')
