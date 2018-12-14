const mongoose = require('mongoose');
const config = require('./../config/config');
const {PubSub, withFilter} = require('graphql-subscriptions');
const {gql} = require('apollo-server-express');

mongoose.connect(config.db.url);

const sessionModel = mongoose.model('Session', {
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  timer: Number,
  countdown: Number,
  active: Boolean,
  percent: Number,
  question: String,
  description: String
});

const optionModel = mongoose.model('Option', {
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  sessionId: String
});

const voteModel = mongoose.model('Vote', {
  _id: mongoose.Schema.Types.ObjectId,
  sessionId: String,
  optionId: String,
  userId: String,
  value: Boolean
});

const userModel = mongoose.model('User', {
  _id: mongoose.Schema.Types.ObjectId,
});

mongoose.Types.ObjectId.prototype.valueOf = function () {
  return this.toString();
};

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
          input CreateOption {
            name: String!
          }
          
          input CreateSession {
            question: String!
            description: String!
          }
  
          type Session {
            _id: ID!,
            name: String!,
            timer: Int!,
            countdown: Int!,
            active: Boolean!,
            percent: Int!,
            question: String!,
            description: String!
          }
        
          type Option {
            _id: ID!,
            name: String!,
            sessionId: String!
            checked: Boolean!
          }
          
          type Vote {
            _id: ID!,
            sessionId: ID!,
            optionId: ID!,
            userId: ID!,
            value: Boolean!
          }
          
          type VoteCount {
            sessionId: ID!,
            optionId: ID!,
            userId: ID!,
            voteCount: Int
          }
          
          type VoteCountBySession {
            count: Int!
          }
          
          type User {
            _id: ID!
          }
          
          type Query {
            session(_id: ID!): Session!
            sessions: [Session]
            options(sessionId: ID!, userId: ID!): [Option]
            votes(sessionId: ID!): [Vote]
            voteCount(sessionId: ID!, userId: ID!): [VoteCount]
            voteCountBySession(sessionId: ID!): VoteCountBySession
            user: User
          }
          
          type Mutation {
            deleteSession(_id: ID!): Boolean
            createSession(createSession: CreateSession!, createOptions: [CreateOption]): Session
            createOption(name: String!, sessionId: ID!): Option
            createVote(sessionId: ID!, optionId: ID!, userId: ID!, value: Boolean): [Option]
            startSession(sessionId: ID!): Session
            createUser: User
          }
          
          type Subscription {
            voteCountBySession(sessionId: ID!): VoteCountBySession
            votes(sessionId: ID!): [Vote]
            voteCount(sessionId: ID!, userId: ID!): [VoteCount]
            timerChanged(sessionId: ID!): Session
            sessionStarted(sessionId: ID!): Session
          }
        `;

const getOptions = (args) => {
  return new Promise((resolve, reject) => {
    optionModel.find({
      sessionId: args.sessionId
    }, (err, options) => {
      if (err) {
        reject(err);
      }
      else {
        voteModel.find({
          sessionId: args.sessionId,
          userId: args.userId,
          value: true
        }).then((votes) => {
          const mappedOptions = options.map(option => {
            option.checked = votes.filter(vote => String(vote.optionId) === String(option._id)).length > 0;
            return option;
          });
          resolve(mappedOptions);
        }).catch(e => {
          console.error(e);
          reject(e);
        });
      }
    });
  });
};

const getVotes = (args) => {
  return new Promise((resolve, reject) => {
    voteModel.find({
      sessionId: args.sessionId
    }, (err, options) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(options);
      }
    });
  });
};

const getVoteCountBySession = (args) => {
  return voteModel.countDocuments({
    sessionId: args.sessionId
  }).then((count) => {
    return {
      count: count
    };
  });
};

const getSessions = (args) => {
  return new Promise((resolve, reject) => {
    sessionModel.find((err, sessions) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(sessions);
      }
    });
  });
};

const getSession = (args) => {
  return new Promise((resolve, reject) => {
    sessionModel.findOne({
      _id: args._id
    }, null, (err, sessions) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(sessions);
      }
    });
  });
};

// Provide resolver functions for your schema fields
const resolvers = {
  Subscription: {
    votes: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('votes'),
        (payload, variables) => {
          return payload && payload.sessionId && payload.sessionId === variables.sessionId;
        }
      ),
      resolve: (payload, args, context, info) => {
        console.log('votes', payload.votes);
        return payload.votes;
      }
    },
    voteCount: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('voteCount'),
        (payload, variables) => {
          console.log('payload', payload);
          return payload;
        }
      )
    },
    voteCountBySession: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('voteCountBySession'),
        (payload, variables) => {
          return payload && payload.sessionId && payload.sessionId === variables.sessionId;
        }
      ),
      resolve: (payload, args, context, info) => {
        return {
          count: payload && payload.voteCount
            ? payload.voteCount
            : 0
        };
      }
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
      return getSession(args);
    },
    sessions: (root, args) => {
      return getSessions(args);
    },
    options: (root, args) => {
      return getOptions(args);
    },
    votes: (root, args) => {
      return getVotes(args);
    },
    voteCount: (root, args) => {
      const {sessionId, userId} = args;
      return createVoteCount(sessionId, userId);
    },

    voteCountBySession: (root, args) => {
      return getVoteCountBySession(args);
    }
  },
  Mutation: {
    deleteSession: (root, args, context, info) => {
      return new Promise((resolve, reject) => {
        sessionModel.deleteOne({
          _id: args._id
        }, null, (err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      });
    },
    createSession: (root, {createSession, createOptions}, context, info) => {
      return new Promise((resolve, reject) => {
        const session = new sessionModel();
        session._id = mongoose.Types.ObjectId();
        session.timer = 0;
        session.countdown = 0;
        session.active = false;
        session.percent = 0;
        session.question = createSession.question;
        session.description = createSession.description;

        session.save((err) => {
          if (err) {
            reject(err);
          }
          else {
            createOptions.forEach((createOption) => {
              const option = new optionModel();
              option._id = mongoose.Types.ObjectId();
              option.sessionId = session._id.toString();
              option.name = createOption.name;
              option.save();
            });
            resolve(session);
          }
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
          if (err) {
            reject(err);
          }
          else {
            resolve(option);
          }
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
    createVote: (root, args) => {
      return voteModel.findOneAndUpdate({
        userId: args.userId,
        sessionId: args.sessionId,
        optionId: args.optionId
      }, {
        userId: args.userId,
        sessionId: args.sessionId,
        optionId: args.optionId,
        value: args.value
      }, {
        upsert: true
      }).then((result) => {
        voteModel.countDocuments({
          sessionId: args.sessionId
        }).then((voteCount) => {
          pubsub.publish('voteCountBySession', {
            sessionId: args.sessionId,
            voteCount
          });

          voteModel.find({
            sessionId: args.sessionId
          }).then((votes) => {
            pubsub.publish('votes', {
              sessionId: args.sessionId,
              votes: votes
            });
          });
        });
        return getOptions({
          sessionId: args.sessionId,
          userId: args.userId
        })
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
