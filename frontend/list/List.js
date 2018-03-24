/* @flow */

import React, { Component } from 'react';
import type { User } from './types';
import ListHeader from '../Header/ListHeader';
import ListPad from './ListPad';
import './List.less';

export default class List extends Component {
  props: {|
    user: User,
    onLogout: () => any,
  |};

  renderPads() {
    return this.props.user.pads.map((pad, i) => {
      let padWithCode = pad;
      if (!pad.code && pad.draft && pad.draft.code) {
        padWithCode = {
          ...pad,
          code: pad.draft.code,
        };
      }
      return <ListPad key={i} pad={padWithCode} />;
    });
  }

  render() {
    return (
      <div className="List">
        <ListHeader user={this.props.user} onLogout={this.props.onLogout} />
        <div className="List-PadList">{this.renderPads()}</div>
      </div>
    );
  }
}
