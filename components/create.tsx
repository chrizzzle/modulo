import Head from 'next/head';
import TextField from '@material-ui/core/TextField/TextField';
import Link from 'next/link';
import Button from '@material-ui/core/Button/Button';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import {CreateOption} from '../entities/CreateOption';
import IconButton from '@material-ui/core/IconButton/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import {ChangeEvent, FormEvent, MouseEvent} from 'react';
import {CreateSession} from '../entities/CreateSession';

interface CreateProps {
    data: {
        createOptions: CreateOption[],
        createSession: CreateSession
    };
    onSessionUpdate: (createSession: CreateSession) => (e: ChangeEvent) => void;
    onOptionUpdate: (createOption: CreateOption) => (e: ChangeEvent) => void;
    onOptionRemove: (createOption: CreateOption) => (e: MouseEvent<HTMLElement>) => void;
    onOptionAdd: (e: MouseEvent<HTMLElement>) => void;
    onSessionCreate: (e: FormEvent) => void
}

export default (props: CreateProps) => (
    <div>
        <Head><title>VTR - Create Poll</title></Head>

        <form noValidate autoComplete="off" onSubmit={props.onSessionCreate}>
            <Grid container spacing={16}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="inherit">Question</Typography>

                    <TextField
                        id="poll-form-question"
                        label="Question"
                        margin="normal"
                        fullWidth
                        onChange={props.onSessionUpdate('question')}
                        value={props.data.createSession.question}
                    />

                    <TextField
                        id="poll-form-description"
                        label="Description"
                        margin="normal"
                        rowsMax="10"
                        helperText="Please add a detailed description to your question"
                        multiline
                        fullWidth
                        onChange={props.onSessionUpdate('description')}
                        value={props.data.createSession.description}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="inherit">Options</Typography>
                    {props.data.createOptions.map((createOption: CreateOption, index: number) =>
                        <TextField
                            key={index}
                            id={`poll-form-option-${index}`}
                            label={`Option ${index + 1}`}
                            margin="normal"
                            value={createOption.name}
                            onChange={props.onOptionUpdate(createOption)}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Delete Option"
                                        onClick={props.onOptionRemove(createOption)}
                                    >
                                        <DeleteOutlinedIcon />
                                    </IconButton>
                                </InputAdornment>,
                            }}
                        />
                    )}
                    <Button type="button" variant="outlined" onClick={props.onOptionAdd}>Add Option</Button>
                </Grid>
            </Grid>

            <Link href="/">
                <Button type="button" variant="outlined">
                    Back
                </Button>
            </Link>&nbsp;&nbsp;
            <Button type="submit" className="poll-form-submit" variant="contained" color="primary">
                Save
            </Button>
        </form>
    </div>
);
