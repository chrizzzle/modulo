import Head from 'next/head';
import Typography from '@material-ui/core/Typography';
import {Session} from '../entities/Session';
import {RadialChart} from 'react-vis';
import {Option} from '../entities/Option';
import {Vote} from '../entities/Vote';
import * as React from 'react';

interface DashboardProps {
    sessionQuery: {
        session: Session;
    };
    optionsQuery: {
        options: Option[];
    };
    votesQuery: {
        votes: Vote[];
    };
    subscribeToMoreVotes: () => void;
}

export default class extends React.Component<DashboardProps, {}> {
    componentDidMount() {
        this.props.subscribeToMoreVotes();
    }

    render () {
        console.log('props', this.props);
        return <div>
            <Head><title>VTR Dashboard</title></Head>
            <Typography component="h1" variant="h5" gutterBottom>
                {this.props.sessionQuery.session.question}
            </Typography>

            <Typography>
                {this.props.sessionQuery.session.description}
            </Typography>

            <Typography>
                {
                    this.props.votesQuery.votes.map((vote: Vote) => <span key={vote._id}>{vote.value}</span>)
                }
            </Typography>

            <RadialChart
                data={[{angle: 1}, {angle: 5}, {angle: 2}]}
                width={300}
                height={300} />
        </div>
    }

};
