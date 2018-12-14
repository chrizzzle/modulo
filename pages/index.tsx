import gql from "graphql-tag";
import Index from '../components/index';
import {compose, graphql} from 'react-apollo';


export const GET_SESSIONS = gql`
{
    sessions {
        _id
        question
        description
    }
}
`;

export default compose(
    graphql(GET_SESSIONS, {
        name: 'data'
    }),
)(Index);
