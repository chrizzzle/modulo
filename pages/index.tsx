import Head from 'next/head';
import Link from 'next/link';


export default () => (
    <div>
        <Head>
            <title>My page title</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <p>Hello world!</p>
        <p><Link prefetch href="/about"><a>About us</a></Link></p>
        <p><a href="/users">Users</a></p>
    </div>
)
