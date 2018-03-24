/* @flow */

import { debounce } from 'lodash';
import React, { Component } from 'react';
import type { Pad as PadType, User, Context, DeployPayload } from './types';
import { getCodeCompiler } from './services/CodeService';
import PadSplit from './PadSplit';

type PadProps = {|
  pad: PadType,
  user: User,
  engineClient: any,
  isDeploying: boolean,
  onDeploy: ('deploy' | 'draft', DeployPayload) => any,
  onFork: () => any,
  onForkDraft: (string, string, Array<Context>, Array<string>) => any,
  onReset: () => any,
  onDownload: string => any,
  onLogin: () => any,
  onLogout: () => any,
  onUpdateMetadata: ({
    title?: string,
    description?: string,
    defaultQuery?: string,
  }) => any,
|};

export default class Pad extends Component {
  babel: any;
  props: PadProps;

  state: {|
    currentCode: string,
    currentContext: Array<Context>,
    error: ?string,
  |};

  constructor(props: PadProps) {
    super(props);
    this.handleDeployDraftDebounced = debounce(this.handleDeployDraft, 750);
    this.state = {
      currentCode: props.pad.code,
      currentContext: props.pad.context || [],
      error: null,
    };
  }

  componentWillReceiveProps(nextProps: PadProps) {
    if (nextProps.pad.id !== this.props.pad.id) {
      this.setState({
        currentCode: nextProps.pad.code,
        currentContext: nextProps.pad.context || [],
        error: null,
      });
    }
  }

  handleCodeChange = (newCode: string) => {
    this.setState(
      {
        currentCode: newCode,
      },
      () => {
        this.handleDeployDraftDebounced();
      },
    );
  };

  handleContextChange = (newContext: Array<Context>) => {
    this.setState(
      {
        currentContext: newContext,
      },
      () => {
        this.handleDeployDraftDebounced();
      },
    );
  };

  handleDeploy = async () => {
    const result = await this.compileCode(this.state.currentCode);
    if (result.ok) {
      this.setState({
        error: null,
      });

      this.props.onDeploy('deploy', {
        code: this.state.currentCode,
        deployedCode: result.code,
        context: this.state.currentContext
          .filter(({ key }) => key !== '')
          .map(({ key, value }) => ({ key, value })),
        dependencies: result.dependencies,
      });
    } else {
      this.setState({
        error: 'Error compiling the code.',
      });
    }
  };

  handleDeployDraft = async () => {
    const code = this.state.currentCode;
    const result = await this.compileCode(code);
    if (code === this.state.currentCode) {
      if (result.ok) {
        this.setState({
          error: null,
        });

        this.props.onDeploy('draft', {
          code,
          deployedCode: result.code,
          context: this.state.currentContext
            .filter(({ key }) => key !== '')
            .map(({ key, value }) => ({ key, value })),
          dependencies: result.dependencies,
        });
      } else {
        this.setState({
          error: 'Error compiling the code.',
        });
      }
    }
  };

  handleDeployDraftDebounced: () => Promise<any>;

  handleDownload = async () => {
    const result = await this.compileCode(this.state.currentCode);
    if (result.ok) {
      this.setState({
        error: null,
      });

      this.props.onDownload(this.state.currentCode);
    } else {
      this.setState({
        // XXX include more useful error message?
        error: 'There has been an error download',
      });
    }
  };

  handleFork = async () => {
    if (this.props.pad.isDraft) {
      const result = await this.compileCode(this.state.currentCode);
      if (result.ok) {
        this.setState({
          error: null,
        });

        this.props.onForkDraft(
          this.state.currentCode,
          result.code,
          this.state.currentContext
            .filter(({ key }) => key !== '')
            .map(({ key, value }) => ({ key, value })),
          result.dependencies,
        );
      } else {
        this.setState({
          error: result.errors.message,
        });
      }
    } else {
      this.props.onFork();
    }
  };

  handleUpdateMetadata = (metadata: {
    title?: string,
    description?: string,
    defaultQuery?: string,
    defaultVariables?: string,
  }) => {
    this.props.onUpdateMetadata(metadata);
  };

  handleReset = () => {
    if (this.props.pad.isDraft) {
      this.props.onReset();
    } else {
      this.setState({
        currentCode: this.props.pad.code,
        currentContext: this.props.pad.context || [],
        error: null,
      });
    }
  };

  async compileCode(
    code: string,
  ): // prettier-ignore
  Promise<
    { ok: false, errors: any } |
    { ok: true, code: string, dependencies: Array<string> }
  > {
    return (await getCodeCompiler())(this.state.currentCode);
  }

  render() {
    return (
      <PadSplit
        pad={this.props.pad}
        user={this.props.user}
        engineClient={this.props.engineClient}
        isDeploying={this.props.isDeploying}
        error={this.state.error}
        currentCode={this.state.currentCode}
        currentContext={this.state.currentContext}
        onCodeChange={this.handleCodeChange}
        onContextChange={this.handleContextChange}
        onFork={this.handleFork}
        onDownload={this.handleDownload}
        onDeploy={this.handleDeploy}
        onReset={this.handleReset}
        onLogin={this.props.onLogin}
        onLogout={this.props.onLogout}
        onSetTitle={title => this.handleUpdateMetadata({ title })}
        onSetDescription={description =>
          this.handleUpdateMetadata({ description })}
        onSetDefaultQuery={(defaultQuery, defaultVariables) =>
          this.handleUpdateMetadata({
            defaultQuery,
            defaultVariables,
          })}
      />
    );
  }
}
