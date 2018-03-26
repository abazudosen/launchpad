/* @flow */

import React, { Component } from 'react';
import gql from 'graphql-tag'
import type { Pad, Context } from '../types';
import HeaderButton from './HeaderButton';

type EngineConnectorProps = {|
  pad: Pad,
  engineClient: any,
  currentContext: Array<Context>,
  onContextChange: (Array<Context>) => any,
|};

type EngineConnectorState = {|
  data: {
    me: ?{ id: string },
    service: ?{ id: string, apiKeys: Array<{ token: string }> },
  },
  loading: boolean,
|};

export default class EngineConnector extends Component<
  void,
  EngineConnectorProps,
  EngineConnectorState,
> {
  subscription: any;
  state = {
    data: {
      me: null,
      service: null,
    },
    loading: true,
  };

  componentDidMount() {
    const observable = this.props.engineClient.watchQuery({
      query: gql`
        query RootQuery($serviceId: ID!) {
          me {
            id
          }
          service(id: $serviceId) {
            id
            apiKeys {
              token
            }
          }
        }
      `,
      variables: {
        serviceId: `launchpad-${this.props.pad.id}`,
      },
    });
    this.subscription = observable.subscribe({
      next: next => {
        this.setState({ data: next.data, loading: next.loading });
      },
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async handleEnableEngine() {
    if (this.state.data.me) {
      const result = await this.props.engineClient.mutate({
        mutation: gql`
          mutation($name: String!, $serviceId: ID!, $accountId: ID!) {
            newService(id: $serviceId, accountId: $accountId, name: $name) {
              id
              apiKeys {
                token
              }
            }
          }
        `,
        variables: {
          serviceId: `launchpad-${this.props.pad.id}`,
          name: this.props.pad.title || `launchpad-${this.props.pad.id}`,
          accountId: this.state.data.me.id,
        },
        refetchQueries: ['RootQuery'],
      });

      const newContext = this.props.currentContext.filter(
        ({ key }) => key !== 'APOLLO_ENGINE_KEY',
      );
      newContext.push({
        key: 'APOLLO_ENGINE_KEY',
        value: result.data.newService.apiKeys[0].token,
      });
      this.props.onContextChange(newContext);
    }
  }

  renderInner() {
    if (this.state.data.me == null) {
      const loginUrl = `https://engine-graphql.apollodata.com/login?cb=${document
        .location.href}`;
      return (
        <HeaderButton onClick={() => (document.location.href = loginUrl)}>
          Login to Apollo Engine
        </HeaderButton>
      );
    } else if (this.state.data.service == null) {
      return (
        <HeaderButton onClick={() => this.handleEnableEngine()}>
          Enable Apollo Engine
        </HeaderButton>
      );
    } else {
      const engineUrl = `https://engine.apollographql.com/service/${this.state
        .data.service.id}`;
      return (
        <HeaderButton onClick={() => window.open(engineUrl, '_blank')}>
          View in Apollo Engine
        </HeaderButton>
      );
    }
  }

  render() {
    if (
      this.props.pad.isDraft ||
      !this.state.data ||
      this.state.loading ||
      !this.props.pad.user ||
      this.props.pad.user.id !== this.props.user.id
    ) {
      return null;
    } else {
      return <div className="Header-EngineButtons">{this.renderInner()}</div>;
    }
  }
}
