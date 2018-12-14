import App, {Container} from 'next/app';
import React from 'react';
import withApolloClient from '../lib/with-apollo-client';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ApolloProvider } from 'react-apollo';
import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';
import getPageContext from '../lib/getPageContext';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Typography from '@material-ui/core/Typography/Typography';
import ReloadIcon from '@material-ui/icons/Autorenew';

class MyApp extends App {
    private pageContext: any;

    constructor(props: any) {
        super(props);
        this.pageContext = getPageContext();
    }

    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render () {
        const {Component, pageProps, apolloClient} = this.props as any;
        return <Container>
            <JssProvider
                registry={this.pageContext.sheetsRegistry}
                generateClassName={this.pageContext.generateClassName}
            >
                <MuiThemeProvider
                    theme={this.pageContext.theme}
                    sheetsManager={this.pageContext.sheetsManager}
                >
                    <CssBaseline />
                    <ApolloProvider client={apolloClient}>
                        <AppBar position="static" color="default">
                            <Toolbar className={"toolbar"}>
                                <a href="/">
                                    <Typography variant="h6" color="inherit">VTR</Typography>
                                </a>
                                <ReloadIcon />
                            </Toolbar>
                        </AppBar>

                        <div className="container">
                            <style jsx global={true}>{`
                                a,
                                a:link,
                                a:hover,
                                a:active,
                                a:visited {
                                    text-decoration: none;
                                    color: currentColor;
                                }
                                .container {
                                    padding: 15px;
                                }
                                .toolbar {
                                    display: flex;
                                    justify-content: space-between;
                                }
                            `}</style>
                            <Component pageContext={this.pageContext} {...pageProps} />
                        </div>
                    </ApolloProvider>
                </MuiThemeProvider>
            </JssProvider>
        </Container>
    }
}

export default withApolloClient(MyApp)
