import gql from "graphql-tag";
import {ApolloCache} from "apollo-cache";
import {CreateOption} from '../../entities/CreateOption';
import {CreateSession} from '../../entities/CreateSession';

export const typeDefs = `
  type CreateOption {
    name: String!
  }
  
  type CreateSession {
    question: String!
    description: String!
  }

  type Mutation {
    addCreateOption(name: String!): CreateOption
  }

  type Query {
    createOptions: [CreateOption]
    createSession: CreateSession
  }
`;

export const defaults = {
    createOptions: [{
        id: Math.random().toString(36).substring(7),
        name: '',
        __typename: 'CreateOption',
    }],
    createSession: {
        question: '',
        description: '',
        __typename: 'CreateSession'
    }
};

const getCreateOptions = (cache: ApolloCache<any>): CreateOption[] => {
    const query = gql`
              query GetCreateOptions {
                createOptions @client {
                  id
                  name
                }
              }
            `;

    const result: {createOptions: CreateOption[]} = cache.readQuery({ query });
    return result.createOptions;
}

export const resolvers = {
    Mutation: {
        updateSession: (_: any, variables: any, ctx: any) => {
            const cache = ctx.cache as ApolloCache<any>;
            const query = gql`
              query GetCreateSession {
                createSession @client {
                  question
                  description
                }
              }
            `;

            const result: {createSession: CreateSession} = cache.readQuery({ query });
            const data = {
                createSession: {
                    ...result.createSession,
                    ...variables.createSession
                }
            };

            cache.writeData({ data });
            return data;
        },
        updateCreateOption: (_: any, variables: any, ctx: any) => {
            const cache = ctx.cache as ApolloCache<any>;
            const createOptions = getCreateOptions(cache);
            const newOptions: CreateOption[] = createOptions
                .map((createOption: CreateOption): CreateOption => {
                    if (createOption.id !== variables.id) {
                        return createOption
                    }

                    return {
                        id: variables.id,
                        name: variables.name,
                        __typename: 'CreateOption',
                    }
                });
            const data = {
                createOptions: newOptions,
            };

            cache.writeData({ data });
            return data;
        },
        removeCreateOption: (_: any, variables: any, ctx: any) => {
            const cache = ctx.cache as ApolloCache<any>;
            const createOptions = getCreateOptions(cache);
            const newOptions: CreateOption[] = createOptions
                .filter((createOption: CreateOption) => createOption.id !== variables.id);
            const data = {
                createOptions: newOptions,
            };
            cache.writeData({ data });
            return data;
        },
        addCreateOption: (_: any, variables: any, ctx: any) => {
            const cache = ctx.cache as ApolloCache<any>;
            const createOptions = getCreateOptions(cache);
            const newOption: CreateOption = {
                id: Math.random().toString(36).substring(7),
                __typename: 'CreateOption',
                name: variables.name
            };
            const data = {
                createOptions: [...createOptions, newOption],
            };
            cache.writeData({ data });
            return data;
        },
    },
};
