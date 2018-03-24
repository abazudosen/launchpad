/* @flow */

import React, { Component } from 'react';
import ReactModal from 'react-modal';
import type { Props as ReactModalProps } from 'react-modal';
import './Modal.less';

type ModalProps = {
  title: string,
  children?: any,
  onRequestClose: $PropertyType<ReactModalProps, 'onRequestClose'>,
};

export default class Modal extends Component {
  props: ModalProps;

  render() {
    const { title, ...restProps } = this.props;

    const newProps = {
      className: 'Modal',
      overlayClassName: 'ModalOverlay',
      contentLabel: title,
      ...restProps,
    };

    return (
      <ReactModal {...newProps}>
        <button onClick={this.props.onRequestClose} className="close-button">
          <span className="icon-cross" />
        </button>
        <div className="Modal-Title">{title}</div>
        <div className="Modal-Body">{this.props.children}</div>
      </ReactModal>
    );
  }
}
