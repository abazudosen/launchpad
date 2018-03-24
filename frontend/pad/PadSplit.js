/* @flow */

import React, { Component } from 'react';
import type { Pad, User, Context } from '../types';
import PadStorage from '../PadStorage';
import Header from '../Header/Header';

import Footer from './Footer';
import GraphiQLWrapper from './GraphiQLWrapper';
import Editor from './code-editor/Editor';
import Logs from './Logs';

import ContextEditor from '../modal/ContextEditor';
import Dependencies from '../modal/Dependencies';
import Modal from '../modal/Modal';

import './PadSplit.less';
import './Resizer.less';
import SplitPane from 'react-split-pane';
import Helmet from 'react-helmet';

type PadSplitProps = {|
  pad: Pad,
  user: ?User,
  engineClient: any,
  currentCode: string,
  currentContext: Array<Context>,
  isDeploying: boolean,
  error: ?string,
  onDeploy: () => any,
  onReset: () => any,
  onFork: () => any,
  onCodeChange: string => any,
  onContextChange: (Array<Context>) => any,
  onLogin: () => any,
  onLogout: () => any,
  onSetTitle: (title: string) => any,
  onSetDescription: (description: string) => any,
  onSetDefaultQuery: (query: string) => any,
  onDownload: () => any,
|};

type View = 'editor' | 'graphiql' | 'both';
type ModalType = 'dependencies' | 'secrets' | 'onboarding';

export default class PadSplit extends Component {
  props: PadSplitProps;
  state: {
    viewing: View,
    isLogOpen: boolean,
    openModal: ?ModalType,
  };

  constructor(props: PadSplitProps) {
    super(props);
    let openModal = null;
    let firstTime = PadStorage.getItem('global', 'visited');
    if (!firstTime) {
      openModal = 'onboarding';
    }
    let viewing = ((PadStorage.getItem(props.pad.id, 'view'): any): ?View);
    if (!viewing) {
      if (window.innerWidth >= 1280) {
        viewing = 'both';
      } else {
        viewing = 'editor';
      }
    }
    this.state = {
      viewing: viewing,
      isLogOpen: false,
      openModal,
    };
  }

  componentDidMount() {
    if (this.hasEmptyContext()) {
      this.showEmptyContext();
    }
  }

  handleChangeViewing = (view: View) => {
    this.setState({
      viewing: view,
    });
    PadStorage.setItem(this.props.pad.id, 'view', view);
  };

  handleResetLinkClick = (evt: Event) => {
    evt.preventDefault();
    this.props.onReset();
  };

  handleLogOpen = () => {
    this.setState({
      isLogOpen: true,
    });
  };

  handleLogClose = () => {
    this.setState({
      isLogOpen: false,
    });
  };

  handleModalOpen = (type: ModalType) => {
    this.setState({
      openModal: type,
    });
  };

  handleModalClose = () => {
    this.setState({
      openModal: null,
    });
  };

  handleOnboardingModalClose = () => {
    PadStorage.setItem('global', 'visited', 'true');
    this.handleModalClose();
  };

  handleDeploy = () => {
    if (this.hasEmptyContext()) {
      this.showEmptyContext();
    } else {
      this.props.onDeploy();
    }
  };

  handleFork = () => {
    if (this.hasEmptyContext()) {
      this.showEmptyContext();
    } else {
      this.props.onFork();
    }
  };

  hasEmptyContext() {
    return this.props.currentContext.some(
      ({ value }) => value != null && value === '',
    );
  }

  showEmptyContext() {
    this.setState({
      openModal: 'secrets',
    });
  }

  renderModals() {
    return [
      <Modal
        key="welcome"
        isOpen={false && this.state.openModal === 'onboarding'}
        onRequestClose={this.handleOnboardingModalClose}
        title="Welcome to Apollo Launchpad!"
      >
        <p>
          This is a tool you can use build, deploy, and share a simple GraphQL
          API right from your browser. We think it's a great way to experiment
          with GraphQL and share examples of different patterns.
        </p>

        <p>
          Visit the{' '}
          <a
            href="https://github.com/apollographql/awesome-launchpad"
            target="_blank"
          >
            awesome-launchpad repository
          </a>{' '}
          to see a list of examples and read the docs. For an introduction, read
          the{' '}
          <a
            href="https://dev-blog.apollodata.com/introducing-launchpad-the-graphql-server-demo-platform-cc4e7481fcba"
            target="_blank"
          >
            announcement blog post
          </a>.
          {/* , or watch a quick video introducing the
        different features. */}
        </p>

        <div className="welcome-modal-start-wrapper">
          <button
            className="welcome-modal-start btn primary"
            onClick={this.handleOnboardingModalClose}
          >
            Start using Launchpad
          </button>
        </div>
      </Modal>,
      <Modal
        key="secrets"
        isOpen={this.state.openModal === 'secrets'}
        onRequestClose={this.handleModalClose}
        title="Edit Server Secrets"
      >
        <ContextEditor
          context={this.props.currentContext}
          onChange={this.props.onContextChange}
        />
      </Modal>,
      <Modal
        key="dependencies"
        isOpen={this.state.openModal === 'dependencies'}
        onRequestClose={this.handleModalClose}
        title="npm Dependencies"
      >
        <Dependencies dependencies={this.props.pad.dependencies} />
      </Modal>,
    ];
  }

  renderLogs() {
    if (this.state.isLogOpen && this.props.pad.token) {
      return (
        <Logs token={this.props.pad.token} onClose={this.handleLogClose} />
      );
    } else {
      return null;
    }
  }

  renderEditors() {
    const canEdit = Boolean(
      !this.props.pad.user ||
        (this.props.user && this.props.pad.user.id === this.props.user.id),
    );

    return (
      <div className="PadSplit-Editors">
        <SplitPane defaultSize="50%">
          <div className="PadSplit-Left">
            <div className="PadSplit-EditorWrapper">
              <Editor
                code={this.props.currentCode}
                canEdit={canEdit}
                onChange={this.props.onCodeChange}
              />
            </div>
            {canEdit ? null : (
              <div className="editor-fork-banner">
                Log in and fork this pad in order to edit it.
              </div>
            )}
            <div className="PadSplit-Logs">{this.renderLogs()}</div>
          </div>
          <div className="PadSplit-Right">
            <GraphiQLWrapper
              pad={this.props.pad}
              user={this.props.user}
              isDeploying={this.props.isDeploying}
              onSetDefaultQuery={this.props.onSetDefaultQuery}
            />
          </div>
        </SplitPane>
      </div>
    );
  }

  renderHelmet() {
    return (
      <Helmet>
        <title>{this.props.pad.title || 'Apollo Launchpad'}</title>
      </Helmet>
    );
  }

  render() {
    return (
      <div className="PadSplit">
        <Header
          pad={this.props.pad}
          user={this.props.user}
          engineClient={this.props.engineClient}
          isDeploying={this.props.isDeploying}
          onDeploy={this.handleDeploy}
          onReset={this.props.onReset}
          onFork={this.handleFork}
          onDownload={this.props.onDownload}
          onLogin={this.props.onLogin}
          onLogout={this.props.onLogout}
          onSetTitle={this.props.onSetTitle}
          onSetDescription={this.props.onSetDescription}
          currentContext={this.props.currentContext}
          onContextChange={this.props.onContextChange}
        />

        <div className="PadSplit-Main">{this.renderEditors()}</div>

        <Footer
          isDraft={this.props.pad.isDraft}
          isDeployed={this.props.pad.isDeployed}
          canSeeLogs={Boolean(this.props.pad.token)}
          url={this.props.pad.url}
          error={this.props.error}
          onResetLinkClick={this.handleResetLinkClick}
          isLogOpen={this.state.isLogOpen}
          onLogOpen={this.handleLogOpen}
          onLogClose={this.handleLogClose}
          onModalOpen={this.handleModalOpen}
        />
        {this.renderModals()}
      </div>
    );
  }
}
