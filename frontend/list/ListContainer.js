/* @flow */

import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag'
import type { User, ApolloData } from './types';
import { LoadingSpinner } from '../LoadingSpinner';
import List from './List';
import './PadContainer.less';

class ListContainer extends Component {
  props: {
    meData: ApolloData<'me', User>,
  };

  handleLogout = () => {
    localStorage.removeItem('LAUNCHPAD_TOKEN');
    this.props.meData.refetch();
  };

  render() {
    if (this.props.meData.loading && !this.props.meData.me) {
      return (
        <div className="PadContainer-Loading">
          <LoadingSpinner size="medium" />
        </div>
      );
    } else if (!this.props.meData.me) {
      document.location.href = '/';
      return (
        <div className="PadContainer-Loading">
          <LoadingSpinner size="medium" />
        </div>
      );
    } else {
      return <List user={this.props.meData.me} onLogout={this.handleLogout} />;
    }
  }
}

const meQuery = gql`
  query User {
    me {
      id
      githubUsername
      pads {
        id
        title
        code
        draft {
          code
        }
        user {
          githubUsername
        }
      }
    }
  }
`;

export default graphql(meQuery, { name: 'meData' })(ListContainer);
