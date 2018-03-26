/* @flow */

import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import { BrowserRouter } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import PadContainer from './pad/PadContainer';
import ListContainer from './list/ListContainer';

const apolloClient = new ApolloClient({
  uri: process.env.REACT_APP_LAUNCHPAD_API_URL,
  request: operation => {
    const token = localStorage.getItem('LAUNCHPAD_TOKEN');
    operation.setContext(context => ({
      headers: {
        ...context.headers,
        authorization: `Bearer: ${token}`,
      },
    }));
  },
});

const engineApolloClient = new ApolloClient({
  uri: 'https://engine-graphql.apollodata.com/api/graphql',
  request: operation => {
    operation.setContext({
      credentials: 'include',
    });
  },
});

export default class App extends Component {
  props: {|
    id: ?string,
    type?: 'pad' | 'list',
  |};

  defaultProps = {
    type: 'pad',
  };

  renderContainer() {
    if (this.props.type === 'list') {
      return <ListContainer />;
    } else {
      return (
        <PadContainer id={this.props.id} engineClient={engineApolloClient} />
      );
    }
  }

  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/list">
              {() => <ListContainer />}
            </Route>
            <Route exact path="/new">
              <PadContainer engineClient={engineApolloClient} />
            </Route>
            <Route path="/:id">
              {({ match }) =>
                match.params.id.length < 8 ||
                !match.params.id.match('^[a-zA-Z0-9_]*$') ? (
                  <Redirect to={'/new'} />
                ) : (
                  <PadContainer
                    id={match.params.id}
                    engineClient={engineApolloClient}
                  />
                )}
            </Route>
            <Redirect from="/" to="/new" />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}
