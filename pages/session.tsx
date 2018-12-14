import gql from "graphql-tag";
import Session from '../components/session';
import {compose, graphql} from 'react-apollo';
import {Option} from '../entities/Option';
import {NextContext} from 'next';
import {ChangeEvent} from 'react';
import {Session as SessionModel} from "entities/Session";
import {GET_SESSIONS} from './index';

interface SessionPageProps {
    sessionId: string | string[] | undefined;
}


const GET_SESSION = gql`
query Session($sessionId: ID!, $userId: ID!) {
    session(_id: $sessionId) {
        _id
        question
        description
    }
    
    options(sessionId: $sessionId, userId: $userId) {
        _id
        name
        checked
    }
    
    voteCountBySession(sessionId: $sessionId){
        count
    }
}
`;

const GET_OPTIONS = gql`
{
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

const VOTE_SUBSCRIPTION = gql`
subscription VoteCount($sessionId: ID!){
    voteCountBySession(sessionId: $sessionId){
        count
    }
}
`;


const SessionPage = compose(
    graphql(GET_SESSION, {
        name: 'data',
        options: (props: SessionPageProps) => ({
            variables: {
                sessionId: props.sessionId,
                userId: '1'
            }
        })
    }),
    graphql(VOTE_SUBSCRIPTION, {
        name: 'voteCount',
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
                    update: (cache, mutationResult) => {
                        console.log(mutationResult);
                        const { options } = cache.readQuery({
                            query: GET_OPTIONS,
                            variables: {
                                sessionId: session._id,
                                userId: '1'
                            }
                        });
                        console.log('new options', options);
                        cache.writeQuery({
                            query: GET_OPTIONS,
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
