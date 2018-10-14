const mongoose = require('mongoose');
const config = require('./../config/config');
const {PubSub, withFilter}  = require('graphql-subscriptions');
const {gql} = require('apollo-server-express');

mongoose.connect(config.db.url);

const sessionModel = mongoose.model('Session', {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    timer: Number,
    countdown: Number,
    active: Boolean,
    percent: Number
});

const optionModel = mongoose.model('Option', {
    _id:  mongoose.Schema.Types.ObjectId,
    name: String,
    sessionId: String
});

const voteModel = mongoose.model('Vote', {
    _id: mongoose.Schema.Types.ObjectId,
    optionId: String,
    sessionId: String,
    userId: String
});

const userModel = mongoose.model('User', {
    _id: mongoose.Schema.Types.ObjectId,
});

const createVoteCount = (sessionId, userId) => {
    return Promise.resolve().then(() => {
        return voteModel.find({
            sessionId,
            userId
        });
    }).then((votes) => {
        const votesByOptions = votes.reduce((acc, vote) => {
            if (!acc[vote.optionId]) {
                acc[vote.optionId] = [];
            }
            acc[vote.optionId].push(vote);
            return acc;
        }, {});

        let result = [];
        for (let optionId in votesByOptions) {
            if (votesByOptions.hasOwnProperty(optionId)) {
                let voteCount = votesByOptions[optionId].length;
                result.push({
                    optionId,
                    sessionId,
                    voteCount
                });
            }
        }
        return result;
    });
};

const pubsub = new PubSub();

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
          type Session {
            _id: ID!,
            name: String!,
            timer: Int!,
            countdown: Int!,
            active: Boolean!,
            percent: Int!
          }
        
          type Option {
            _id: ID!,
            name: String!,
            sessionId: String!
          }
          
          type Vote {
            _id: ID!,
            sessionId: ID!,
            optionId: ID!,
            userId: ID!
          }
          
          type VoteCount {
            sessionId: ID!,
            optionId: ID!,
            userId: ID!,
            voteCount: Int
          }
          
          type User {
            _id: ID!
          }
          
          type Query {
            session(_id: ID!): Session!
            sessions: [Session]
            options(sessionId: ID!): [Option]
            votes(sessionId: ID!): [Vote]
            voteCount(sessionId: ID!, userId: ID!): [VoteCount]
            user: User
          }
          
          type Mutation {
            deleteSession(_id: ID!): Boolean
            createSession(name: String!): Session
            createOption(name: String!, sessionId: ID!): Option
            createVote(sessionId: ID!, optionId: ID!, userId: ID!): Vote
            startSession(sessionId: ID!): Session
            createUser: User
          }
          
          type Subscription {
            voteCount(sessionId: ID!, userId: ID!): [VoteCount]
            timerChanged(sessionId: ID!): Session
            sessionStarted(sessionId: ID!): Session
          }
        `;

// Provide resolver functions for your schema fields
const resolvers = {
    Subscription: {
        voteCount: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('voteCount'),
                (payload, variables) => {
                    console.log('payload', payload);
                    return payload;
                }
            )
        },
        sessionStarted: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('sessionStarted'),
                (payload, variables) => {
                    return payload &&
                        (payload.sessionId === variables.sessionId);
                }
            )
        },
        timerChanged: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('timerChanged'),
                (payload, variables) => {
                    return payload &&
                        (payload.timerChanged._id.toString() === variables.sessionId);
                }
            )
        }
    },
    Query: {
        session: (root, args, context) => {
            return new Promise((resolve, reject) => {
                sessionModel.findOne({
                    _id: args._id
                }, null, (err, sessions) => {
                    if (err) { reject(err); }
                    else { resolve(sessions); }
                });
            });
        },
        sessions: (root, args, context) => {
            return new Promise((resolve, reject) => {
                sessionModel.find((err, sessions) => {
                    if (err) { reject(err); }
                    else { resolve(sessions); }
                });
            });
        },
        options: (root, args, context) => {
            return new Promise((resolve, reject) => {
                optionModel.find({
                    sessionId: args.sessionId
                }, (err, options) => {
                    if (err) { reject(err); }
                    else {resolve(options);}
                });
            });
        },
        votes: (root, args, context) => {
            return new Promise((resolve, reject) => {
                voteModel.find({
                    sessionId: args.sessionId
                }, (err, options) => {
                    if (err) { reject(err); }
                    else { resolve(options); }
                });
            });
        },
        voteCount: (root, args, context) => {
            const {sessionId, userId} = args;
            return createVoteCount(sessionId, userId);
        }
    },
    Mutation: {
        deleteSession: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                sessionModel.deleteOne({
                    _id: args._id
                }, null, (err) => {
                    if (err) { reject(err); }
                    else { resolve(); }
                });
            });
        },
        createSession: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const session = new sessionModel(args);
                session._id = mongoose.Types.ObjectId();
                session.timer = 0;
                session.countdown = 0;
                session.active = false;
                session.percent = 0;

                session.save((err) => {
                    if (err) { reject(err); }
                    else { resolve(session); }
                });
            });
        },
        createOption: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const option = new optionModel(args);
                option._id = mongoose.Types.ObjectId();
                option.sessionId = args.sessionId;
                option.name = args.name;
                option.save((err) => {
                    if (err) { reject(err); }
                    else { resolve(option); }
                });
            });
        },
        createUser: (root, args, context, info) => {
            const user = new userModel();
            user._id = mongoose.Types.ObjectId();
            return Promise.resolve().then(() => {
                return user.save();
            });

        },
        startSession: (root, args, context, info) => {
            return Promise.resolve()
                .then(() => {
                    return sessionModel.findOne({
                        _id: args.sessionId
                    }, null);
                })
                .then((session) => {
                    session.active = true;
                    return session.save();
                })
                .then((session) => {
                    let counter = 100;
                    const interval = setInterval(() => {
                        counter--;
                        session.timer = parseInt(counter);
                        session.percent = parseInt(Math.round((counter / 100) * 100));
                        session.save(session).then((sessionData) => {
                            pubsub.publish('timerChanged', {
                                timerChanged: sessionData
                            });
                        });

                        if (counter <= 0) {
                            clearInterval(interval);
                            session.active = false;
                            session.save();
                        }
                    }, 1000);
                });
        },
        createVote: (root, args, context, info) => {
            const {sessionId, optionId, userId} = args;
            return Promise.resolve()
                .then(() => {
                    return sessionModel.findOne({
                        _id: sessionId
                    });
                })
                .then((session) => {
                    if (!session.active) {
                        throw new Error('Session not active');
                    }
                })
                .then(() => {
                    const vote = new voteModel(args);
                    vote._id = mongoose.Types.ObjectId();
                    return vote.save();
                }).then((vote) => {
                    createVoteCount(sessionId, userId).then((voteCount) => {
                        pubsub.publish('voteCount', {
                            voteCount
                        });
                    });
                    return vote;
                }).then((vote) => {
                    return vote;
                }).catch((e) => {
                    console.warn('Error while creating vote', e.message);
                });
        }
    }
};

module.exports = {
    typeDefs,
    resolvers
};
