/* @flow */

import React, { Component } from 'react';
import './Logs.less';

type LogsProps = {
  token: string,
  onClose: () => any,
};

export default class Logs extends Component {
  logsEl: HTMLElement;
  props: LogsProps;

  componentDidMount() {
    window.ExtendEditorLogsComponent.show(this.logsEl, {
      theme: 'light',
      height: 200,
      token: this.props.token,
      webtaskName: 'draft',
      hostUrl: 'https://wt-launchpad.it.auth0.com',
      filter: '^(new|finished)',
      onClose: () => {
        this.props.onClose();
      },
      onError: () => {
        this.props.onClose();
      },
    });
  }

  componentWillUnmount() {
    window.ExtendEditorLogsComponent.destroy(this.logsEl);
  }

  render() {
    return (
      <div className="Logs">
        <div className="Logs-Body" ref={el => (this.logsEl = el)} />
      </div>
    );
  }
}
