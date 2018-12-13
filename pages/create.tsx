import gql from 'graphql-tag';
import {CreateOption} from '../entities/CreateOption';
import {compose, graphql} from 'react-apollo';
import Create from '../components/create';
import Router from 'next/router';
import {GET_SESSIONS} from './index';

const CREATE_SESSION = gql`
  mutation CreateSession($createSession: CreateSession! $createOptions: [CreateOption]!) {
    createSession(createSession: $createSession, createOptions: $createOptions) {
        _id
        question
        description
        timer
        countdown
        active
        percent
    }
  }
`;

const ADD_CREATE_OPTION = gql`
  mutation AddCreateOption($name: String!) {
    addCreateOption(name: $name) @client
  }
`;

const REMOVE_CREATE_OPTION = gql`
  mutation RemoveCreateOption($id: String!) {
    removeCreateOption(id: $id) @client
  }
`;

const UPDATE_CREATE_OPTION = gql`
  mutation UpdateCreateOption($id: String!, $name: String!) {
    updateCreateOption(id: $id, name: $name) @client
  }
`;

const UPDATE_SESSION = gql`
    mutation UpdateSession($createSession: CreateSession!) {
     updateSession(createSession: $createSession) @client
    }
`;

const GET_CREATE_DATA = gql`
    query {
        createSession @client {
            question
            description
        }
        createOptions @client {
            id
            name
        }
    }   
  `;

export default compose(
    graphql(GET_CREATE_DATA, {
        name: 'data'
    }),
    graphql(CREATE_SESSION, {
        name: 'createSessionMutation',
        props: (props: any) => ({
            ...props,
            onSessionCreate: (e: Event) => {
                e.preventDefault();
                props.createSessionMutation({
                    variables: {
                        createSession: {
                            question: props.ownProps.data.createSession.question,
                            description: props.ownProps.data.createSession.description,
                        },
                        createOptions: props.ownProps.data.createOptions.map((createOption: CreateOption) => ({
                            name: createOption.name
                        }))
                    },
                    update: (cache, { data: { createSession } }) => {
                        const { sessions } = cache.readQuery({ query: GET_SESSIONS });
                        cache.writeQuery({
                            query: GET_SESSIONS,
                            data: { sessions: sessions.concat([createSession]) }
                        });
                    }
                }).then(() => {
                    Router.push('/');
                });
            }
        })
    }),
    graphql(UPDATE_SESSION, {
        name: 'updateSessionMutation',
        props: (props: any) => ({
            ...props,
            onSessionUpdate: (field: string) => (e: Event) => {
                e.preventDefault();
                props.updateSessionMutation({
                    variables: {
                        createSession: {
                            ...props.ownProps.data.createSession,
                            [field]: e.currentTarget.value
                        }
                    }
                })
            }
        })
    }),
    graphql(UPDATE_CREATE_OPTION, {
        name: 'updateOptionMutation',
        props: (props: any) => ({
            ...props,
            onOptionUpdate: (createOption: CreateOption) => (e: Event) => {
                e.preventDefault();
                props.updateOptionMutation({
                    variables: {
                        id: createOption.id,
                        name: e.currentTarget.value
                    }
                })
            }
        })
    }),
    graphql(REMOVE_CREATE_OPTION, {
        name: 'removeOptionMutation',
        props: (props: any) => ({
            ...props,
            onOptionRemove: (createOption: CreateOption) => (e: Event) => {
                e.preventDefault();
                props.removeOptionMutation({
                    variables: {
                        id: createOption.id
                    }
                })
            }
        })
    }),
    graphql(ADD_CREATE_OPTION, {
        name: 'addOptionMutation',
        props: (props: any) => ({
            ...props,
            onOptionAdd: (e: Event) => {
                e.preventDefault();
                props.addOptionMutation({
                    variables: {
                        name: ''
                    }
                })
            }
        })
    })
)(Create)
