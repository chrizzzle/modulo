import Button from '@material-ui/core/Button/Button';
import {Session} from '../entities/Session';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import CheckIcon from '@material-ui/icons/Check';

import Head from 'next/head';


interface IndexProps {
    data: {
        sessions: Session[]
    }
}

export default (props: IndexProps) => (
    <div>
        <Head><title>VTR</title></Head>
        {
            props.data.sessions.map((session: Session) => (
                <a href={`/session?id=${session._id}`} key={session._id}>
                    <ListItem disableGutters={true}>
                        <ListItemText primary={session.question} secondary={session.description}/>
                        <ListItemIcon>
                            <CheckIcon/>
                        </ListItemIcon>
                    </ListItem>
                </a>
            ))
        }
        <a href="/create">
            <Button variant="contained" color="primary">Create new Poll</Button>
        </a>
    </div>
);
