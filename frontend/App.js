/* @flow */

import React, { Component } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
} from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import PadContainer from './pad/PadContainer';
import ListContainer from './list/ListContainer';

const networkInterface = createNetworkInterface({
  uri: process.env.REACT_APP_LAUNCHPAD_API_URL,
});

networkInterface.use([
  {
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {};
      }
      const token = localStorage.getItem('LAUNCHPAD_TOKEN');
      if (token) {
        req.options.headers['authorization'] = `Bearer: ${token}`;
      }
      next();
    },
  },
]);

const apolloClient = new ApolloClient({
  networkInterface,
});

const engineNetworkInterface = createNetworkInterface({
  uri: 'https://engine-graphql.apollodata.com/api/graphql',
  opts: {
    credentials: 'include',
  },
});

const engineApolloClient = new ApolloClient({
  networkInterface: engineNetworkInterface,
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
