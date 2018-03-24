/* @flow */

import React, { Component } from 'react';
import './KeyValueEditor.less';

type KeyValue = { key: string, value?: string };

export default class KeyValueEditor extends Component {
  props: {|
    value: Array<KeyValue>,
    onChange: (value: Array<KeyValue>) => any,
    hilightEmpty?: boolean,
  |};

  handleExistingChange = (
    event: Event & { currentTarget: HTMLInputElement },
    index: number,
    key: 'key' | 'value',
  ) => {
    const value = this.props.value
      .slice(0, index)
      .concat([
        {
          ...this.props.value[index],
          [key]: event.currentTarget.value,
        },
      ])
      .concat(this.props.value.slice(index + 1));
    this.props.onChange(value);
  };

  handleAddLine = () => {
    const context = [
      ...this.props.value,
      {
        key: '',
        value: '',
      },
    ];
    this.props.onChange(context);
  };

  handleDeleteLine = (index: number) => {
    const context = this.props.value
      .slice(0, index)
      .concat(this.props.value.slice(index + 1));
    this.props.onChange(context);
  };

  renderValueInput(value: ?string, i: number) {
    if (value != null) {
      let className = 'KeyValueEditor-Input';
      if (value === '' && this.props.hilightEmpty) {
        className += ' KeyValueEditor-Input--error';
      }
      return (
        <input
          className={className}
          value={value}
          onChange={event => this.handleExistingChange(event, i, 'value')}
        />
      );
    } else {
      return <input className="KeyValueEditor-Input" value="*****" disabled />;
    }
  }

  renderInputs() {
    return this.props.value.map(({ key, value }, i) => (
      <div className="KeyValueEditor-Line" key={i}>
        <input
          className="KeyValueEditor-Input"
          value={key}
          disabled={value === null}
          onChange={event => this.handleExistingChange(event, i, 'key')}
        />
        {this.renderValueInput(value, i)}
        <button
          className="KeyValueEditor-DeleteButton"
          onClick={() => this.handleDeleteLine(i)}
        >
          <span className="icon-cross" />
        </button>
      </div>
    ));
  }

  render() {
    return (
      <div className="KeyValueEditor">
        <div className="KeyValueEditor-Line">
          <div className="KeyValueEditor-Label">Key</div>
          <div className="KeyValueEditor-Label">Value</div>
        </div>
        {this.renderInputs()}
        <button
          className="KeyValueEditor-AddButton btn primary"
          onClick={this.handleAddLine}
        >
          <span>Add</span>
          <span className="icon-plus" />
        </button>
      </div>
    );
  }
}
