import * as React from 'react';
import Head from 'next/head';
import {Component, SyntheticEvent} from 'react';
import {User} from '../entities/User';

export interface UsersProps {
    users: User[];
    createUser: () => void;
}

export default class Users extends Component<UsersProps, any> {

    static async getInitialProps(context: any) {
        const users = await context.req.db.collection('User').find().toArray();
        return { users: users };
    }

    createUser(e: SyntheticEvent) {
        const form = e.currentTarget as any;
        e.preventDefault();
        fetch(`${process.env.API_BASE}/api`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: form.username.value
            })
        }).then(() => {
            window.location.reload();
        });
    }

    render() {
        return (
            <div>
                <Head>
                    <title>Users</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                </Head>
                <p>Hello world!</p>

                {this.props.users.map(user => {
                    return <div key={user._id}>{user.username}</div>
                })}

                <form method="POST" onSubmit={this.createUser}>
                    <input type="text" name="username" />
                    <input type="submit" value="save"/>
                </form>
            </div>
        )
    }
}
