import {Session} from '../entities/Session';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {Option} from '../entities/Option';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {ChangeEvent} from 'react';


interface SessionProps {
    data: {
        session: Session;
        options: Option[];
        voteCountBySession: {
            count: number;
        }
    };
    onVoteOption: (session: Session, option: Option) => (e: ChangeEvent) => void;
    voteCount: {
        error: any;
        loading: boolean;
        voteCountBySession: {
            count: number;
        };
    }
}

export default (props: SessionProps) => {
    const count = props.voteCount && props.voteCount.voteCountBySession && props.voteCount.voteCountBySession.count
        ? props.voteCount.voteCountBySession.count
        : props.data.voteCountBySession.count;

    const voteString = count === 1 ? 'Vote' : 'Votes';

    return <div>
        <Typography component="h1" variant="h5" gutterBottom>
            {props.data.session.question}
        </Typography>
        <Typography>
            {props.data.session.description}<br />
            {`${count} ${voteString}`}
        </Typography>

        <RadioGroup
            aria-label="Answer"
            name="answer">
            {
                props.data.options.map(
                    (option: Option) =>
                        <FormControlLabel
                            value={option.name}
                            control={<Checkbox checked={option.checked} onChange={props.onVoteOption(props.data.session, option)}/>}
                            label={option.name}
                            key={option._id}/>
                )
            }
        </RadioGroup>
    </div>
};
