/* @flow */
/**
 * Edits the secrets for a pad
 */

import React, { Component } from 'react';
import type { Context } from './types';
import KeyValueEditor from './KeyValueEditor';
import './ContextEditor.less';

export default class ContextEditor extends Component {
  props: {|
    context: Array<Context>,
    onChange: (contexts: Array<Context>) => any,
  |};

  render() {
    return (
      <div className="ContextEditor">
        <KeyValueEditor
          value={this.props.context}
          onChange={this.props.onChange}
          hilightEmpty
        />
      </div>
    );
  }
}
