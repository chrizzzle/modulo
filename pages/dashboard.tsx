import Dashboard from '../components/dashboard';
import gql from "graphql-tag";
import {compose, graphql} from 'react-apollo';
import {GET_OPTIONS_BY_SESSION_AND_USER, GET_SESSION} from './session';
import {NextContext} from 'next';

interface DashboardPageProps {
    sessionId: string | string[] | undefined;
}

export const VOTES_BY_SESSION_QUERY = gql`
    query Votes($sessionId: ID!) {
        votes(sessionId: $sessionId) {
            _id
            optionId
            sessionId
            userId
            value
        }
    }
`;

const VOTES_BY_SESSION_SUBSCRIPTION = gql`
    subscription Votes($sessionId: ID!) {
        votes(sessionId: $sessionId) {
            _id
            optionId
            sessionId
            userId
            value
        }
    }
`;

const DashboardPage = compose(
    graphql(GET_SESSION, {
        name: 'sessionQuery',
        options: (props: DashboardPageProps) => ({
            variables: {
                sessionId: props.sessionId
            }
        })
    }),
    graphql(GET_OPTIONS_BY_SESSION_AND_USER, {
        name: 'optionsQuery',
        options: (props: DashboardPageProps) => ({
            variables: {
                sessionId: props.sessionId,
                userId: '1'
            }
        })
    }),
    graphql(VOTES_BY_SESSION_QUERY, {
        name: 'votesQuery',
        props: (props: any) => ({
            ...props,
            subscribeToMoreVotes: () => {
                props.votesQuery.subscribeToMore({
                    document: VOTES_BY_SESSION_SUBSCRIPTION,
                    variables: {
                        sessionId: props.ownProps.sessionQuery.session._id
                    },
                    updateQuery: (previous, next) => {
                        console.log(next.subscriptionData.data);
                        return next.subscriptionData.data;
                    }
                });
            }
        }),
        options: (props: DashboardPageProps) => ({
            variables: {
                sessionId: props.sessionId
            }
        })
    })
)(Dashboard);

DashboardPage.getInitialProps = (context: NextContext): DashboardPageProps => {
    return {sessionId: context.query.id};
};

export default DashboardPage;
