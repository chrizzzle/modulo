import gql from "graphql-tag";
import Session from '../components/session';
import {compose, graphql} from 'react-apollo';
import {Option} from '../entities/Option';
import {NextContext} from 'next';
import {ChangeEvent} from 'react';
import {Session as SessionModel} from "entities/Session";

interface SessionPageProps {
    sessionId: string | string[] | undefined;
}


export const GET_SESSION = gql`
query Session($sessionId: ID!) {
    session(_id: $sessionId) {
        _id
        question
        description
    }
}`;

const GET_VOTE_COUNT_BY_SESSION = gql`
query VoteCount($sessionId: ID!) {
    voteCountBySession(sessionId: $sessionId){
        count
    }
}
`;

export const GET_OPTIONS_BY_SESSION_AND_USER = gql`
query Options($sessionId: ID!, $userId: ID!) {
    options(sessionId: $sessionId, userId: $userId) {
        _id
        name
        checked
    }
}
`;

const CREATE_VOTE = gql`
mutation CreateVote($sessionId: ID!, $optionId: ID!, $userId: ID!, $value: Boolean!) {
    createVote(sessionId: $sessionId, optionId: $optionId, userId: $userId, value: $value) {
        _id
        name
        checked
    }
}
`;

export const VOTE_COUNT_SUBSCRIPTION = gql`
subscription VoteCount($sessionId: ID!){
    voteCountBySession(sessionId: $sessionId){
        count
    }
}
`;


const SessionPage = compose(
    graphql(GET_SESSION, {
        name: 'sessionQuery',
        options: (props: SessionPageProps) => ({
            variables: {
                sessionId: props.sessionId
            }
        })
    }),
    graphql(GET_OPTIONS_BY_SESSION_AND_USER, {
        name: 'optionsQuery',
        options: (props: SessionPageProps) => ({
            variables: {
                sessionId: props.sessionId,
                userId: '1'
            }
        })
    }),
    graphql(GET_VOTE_COUNT_BY_SESSION, {
        name: 'voteCountQuery',
        options: (props: SessionPageProps) => ({
            variables: {
                sessionId: props.sessionId
            }
        })
    }),
    graphql(VOTE_COUNT_SUBSCRIPTION, {
        name: 'voteCountSubscription',
        options: (props: SessionPageProps) => ({
            variables: {
                sessionId: props.sessionId
            }
        })
    }),
    graphql(CREATE_VOTE, {
        name: 'createVoteMutation',
        props: (props: any) => ({
            ...props,
            onVoteOption: (session: SessionModel, option: Option) => (e: ChangeEvent) => {
                e.preventDefault();
                props.createVoteMutation({
                    variables: {
                        sessionId: String(session._id),
                        optionId: String(option._id),
                        userId: '1',
                        value: (e.target as HTMLFormElement).checked
                    },
                    update: (cache) => {
                        const { options } = cache.readQuery({
                            query: GET_OPTIONS_BY_SESSION_AND_USER,
                            variables: {
                                sessionId: session._id,
                                userId: '1'
                            }
                        });
                        cache.writeQuery({
                            query: GET_OPTIONS_BY_SESSION_AND_USER,
                            data: { options: options }
                        });
                    }
                })
            }
        })
    })
)(Session);

SessionPage.getInitialProps = (context: NextContext): SessionPageProps => {
    return {sessionId: context.query.id};
};

export default SessionPage;
