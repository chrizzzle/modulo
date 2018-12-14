import {Session} from '../entities/Session';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {ChangeEvent} from 'react';
import {Option} from '../entities/Option';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button/Button';


interface SessionProps {
    sessionQuery: {
        session: Session;
    };
    optionsQuery: {
        options: Option[];
    };
    voteCountQuery: {
        voteCountBySession: {
            count: number;
        }
    }
    voteCountSubscription: {
        error: any;
        loading: boolean;
        voteCountBySession: {
            count: number;
        };
    }
    onVoteOption: (session: Session, option: Option) => (e: ChangeEvent) => void;
}

export default (props: SessionProps) => {
    console.log('props', props);
    const count = props.voteCountSubscription &&
                  props.voteCountSubscription.voteCountBySession &&
                  props.voteCountSubscription.voteCountBySession.count
        ? props.voteCountSubscription.voteCountBySession.count
        : props.voteCountQuery.voteCountBySession.count;

    const voteString = count === 1 ? 'Vote' : 'Votes';

    return <div>
        <Typography component="h1" variant="h5" gutterBottom>
            {props.sessionQuery.session.question}
        </Typography>
        <Typography>
            {props.sessionQuery.session.description}<br />
            {`${count} ${voteString}`}
        </Typography>

        <RadioGroup
            aria-label="Answer"
            name="answer">
            {
                props.optionsQuery.options.map(
                    (option: Option) =>
                        <FormControlLabel
                            value={option.name}
                            control={<Checkbox checked={option.checked} onChange={props.onVoteOption(props.sessionQuery.session, option)}/>}
                            label={option.name}
                            key={option._id}/>
                )
            }
        </RadioGroup>

        <a href="/">
            <Button type="button" variant="outlined">
                Back
            </Button>
        </a>
        &nbsp;&nbsp;
        <a href={`/dashboard?id=${props.sessionQuery.session._id}`}>
            <Button type="button" variant="outlined">
                Dashboard
            </Button>
        </a>
    </div>
};
