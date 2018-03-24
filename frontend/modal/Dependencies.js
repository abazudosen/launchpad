/* @flow */

import React, { Component } from 'react';
import type { Dependency } from './types';
import './Dependencies.less';

export default class Dependencies extends Component {
  props: {
    dependencies: ?Array<Dependency>,
  };

  renderDependencies() {
    if (this.props.dependencies && this.props.dependencies.length > 0) {
      return (
        <div className="Dependencies-List">
          {this.props.dependencies.map(({ name, version }, i) => (
            <div className="Dependencies-Item" key={i}>
              <div className="Dependencies-Name">{name}</div>
              <div className="Dependencies-Version">{version}</div>
            </div>
          ))}
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className="Dependencies">
        <p>
          Dependencies are detected automatically from <code>import</code>{' '}
          statements in your code when you save, and the latest versions are
          selected.
        </p>
        {this.renderDependencies()}
      </div>
    );
  }
}
