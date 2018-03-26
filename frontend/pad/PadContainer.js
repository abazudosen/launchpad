/* @flow */

import React, { Component } from 'react';
import { graphql, compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import type {
  Pad as PadType,
  User as UserType,
  Context,
  ApolloData,
  ApolloMutationResult,
  DeployPayload,
} from './types';
import { getLock } from '../services/Auth0LockService';
import { download } from '../services/EjectService';
import Pad from './Pad';
import './PadContainer.less';
import { LoadingSpinner } from '../LoadingSpinner';

type PadContainerProps = {|
  id: string,
  client: any,
  engineClient: any,
  padData: ApolloData<'pad', PadType>,
  meData: ApolloData<'me', UserType>,
  updatePad: ({
    variables: {
      pad: {|
        id: ?string,
        code: string,
        deployedCode: string,
        context: Array<Context>,
        dependencies: Array<string>,
      |},
    },
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
  updateDraft: ({
    variables: {
      pad: {|
        id: ?string,
        code: string,
        deployedCode: string,
        context: Array<Context>,
        dependencies: Array<string>,
      |},
    },
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
  forkPad: ({
    variables: {|
      id: string,
    |},
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
  createPad: ({
    variables: {
      pad: {|
        code: string,
        deployedCode: string,
        context: Array<Context>,
        dependencies: Array<string>,
      |},
    },
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
  deleteDraft: ({
    variables: {
      id: string,
    },
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
  updateMetadata: ({
    variables: {
      id: string,
      title?: string,
      description?: string,
      defaultQuery?: string,
    },
  }) => Promise<ApolloMutationResult<'pad', PadType>>,
|};

class PadContainer extends Component {
  props: PadContainerProps;

  state: {
    isDeploying: boolean,
    nextDeploy: ?DeployPayload,
  } = {
    isDeploying: false,
    nextDeploy: null,
  };

  lock: any;

  componentDidMount() {
    getLock().then(Auth0Lock => {
      this.lock = new Auth0Lock(
        process.env.REACT_APP_AUTH0_CLIENT_ID,
        process.env.REACT_APP_AUTH0_DOMAIN,
        {
          auth: {
            redirect: false,
            params: {
              scope: 'openid nickname',
            },
          },
        },
      );
      this.lock.on('authenticated', authResult => {
        this.lock.getUserInfo(
          authResult.accessToken,
          async (error, profile) => {
            if (error) {
              console.log(error);
              return;
            }

            localStorage.setItem('LAUNCHPAD_TOKEN', authResult.idToken);
            const meRefetch = this.props.meData.refetch();
            if (this.props.padData.pad && this.props.padData.pad.url) {
              await Promise.all([meRefetch, this.props.padData.refetch()]);
            } else {
              await meRefetch;
            }
            this.lock.hide();
          },
        );
      });
    });
  }

  componentWillUnmount() {
    if (this.lock) {
      this.lock.removeAllListeners();
    }
  }

  handleLogin = () => {
    if (this.lock) {
      this.lock.show();
    }
  };

  handleLogout = async () => {
    localStorage.removeItem('LAUNCHPAD_TOKEN');
    this.props.meData.refetch();
  };

  handleCodeChange = (newCode: string) => {};

  handleContextChange = (newContext: Array<Context>) => {};

  handleDeploy = (target: 'deploy' | 'draft', payload: DeployPayload) => {
    if (!this.state.isDeploying) {
      this.setState({
        isDeploying: true,
      });
      this.performDeploy(target, payload);
    } else {
      if (target === 'draft') {
        this.setState({
          nextDeploy: payload,
        });
      }
    }
  };

  async performDeploy(
    target: 'deploy' | 'draft',
    { code, deployedCode, context, dependencies }: DeployPayload,
  ) {
    let result;
    try {
      let deploy;
      if (target === 'deploy') {
        deploy = this.props.updatePad;
      } else {
        deploy = this.props.updateDraft;
      }
      result = await deploy({
        variables: {
          pad: {
            id: this.props.padData.pad.id,
            code,
            deployedCode,
            context,
            dependencies,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
    this.afterDeploy(target, result);
  }

  afterDeploy(target, result) {
    if (
      result &&
      target === 'deploy' &&
      document.location.pathname === '/new'
    ) {
      window.history.pushState(
        {},
        'Apollo Launchpad',
        `/${result.data.pad.id}`,
      );
    }

    if (this.state.nextDeploy) {
      const nextDeploy = this.state.nextDeploy;
      this.setState(
        {
          nextDeploy: null,
          isDeploying: true,
        },
        () => {
          this.performDeploy('draft', nextDeploy);
        },
      );
    } else {
      this.setState({
        isDeploying: false,
      });
    }
  }

  handleDownload = async (currentCode: string) => {
    this.setState({
      isDeploying: true,
    });
    const result = await this.props.client.query({
      query: padQuery,
      variables: { id: this.props.padData.pad.id },
    });

    if (result.errors) {
      console.error(
        'There were errors when executing the GraphQL query needed to download this launchpad',
      );
      result.errors.forEach(err => console.error(err.message));
      this.setState({
        isDeploying: false,
      });
      return;
    }

    await download(result.data.pad, currentCode);

    this.setState({
      isDeploying: false,
    });
  };

  handleFork = async () => {
    if (!this.state.isDeploying) {
      try {
        this.setState({
          isDeploying: true,
        });
        const result = await this.props.forkPad({
          variables: {
            id: this.props.padData.pad.id,
          },
        });
        document.location.href = `/${result.data.pad.id}`;
      } catch (e) {
        console.error(e);
        this.setState({
          isDeploying: false,
        });
      }
    }
  };

  handleForkDraft = async (
    newCode: string,
    newDeployedCode: string,
    newContext: Array<Context>,
    newDependencies: Array<string>,
  ) => {
    if (!this.state.isDeploying) {
      this.setState({
        isDeploying: true,
      });
      try {
        const result = await this.props.createPad({
          variables: {
            pad: {
              code: newCode,
              deployedCode: newDeployedCode,
              context: newContext,
              dependencies: newDependencies,
            },
          },
        });
        document.location.href = `/${result.data.pad.id}`;
      } catch (e) {
        console.error(e);
        this.setState({
          isDeploying: false,
        });
      }
    }
  };

  handleReset = async () => {
    if (!this.state.isDeploying) {
      this.setState({
        isDeploying: true,
      });
      try {
        await this.props.deleteDraft({
          variables: {
            id: this.props.padData.pad.id,
          },
        });
        this.setState({
          isDeploying: false,
        });
      } catch (e) {
        console.error(e);
        this.setState({
          isDeploying: false,
        });
      }
    }
  };

  handleUpdateMetadata = async (input: {
    title?: string,
    description?: string,
    defaultQuery?: string,
  }) => {
    if (!this.state.isDeploying) {
      this.setState({
        isDeploying: true,
      });
      try {
        await this.props.updateMetadata({
          variables: {
            id: this.props.padData.pad.id,
            ...input,
          },
        });
        this.setState({
          isDeploying: false,
        });
      } catch (e) {
        console.error(e);
        this.setState({
          isDeploying: false,
        });
      }
    }
  };

  isLoading() {
    return (
      (this.props.padData.loading && !this.props.padData.pad) ||
      (this.props.meData.loading && !this.props.meData.me)
    );
  }

  hasError() {
    return Boolean(this.props.padData.error || this.props.meData.error);
  }

  getErrorMessage(): ?string {
    if (this.props.padData.error) {
      return this.props.padData.error.message;
    } else if (this.props.meData.error) {
      return this.props.meData.error.message;
    } else {
      return null;
    }
  }

  render() {
    if (this.isLoading()) {
      return (
        <div className="PadContainer-Loading">
          <LoadingSpinner size="medium" />
        </div>
      );
    } else if (this.hasError()) {
      return <div>{this.getErrorMessage()}</div>;
    } else {
      let pad = this.props.padData.pad;
      const me = this.props.meData.me;

      if (pad.draft) {
        pad = {
          ...pad.draft,
          isDraft: true,
          isDeployed: pad.url != null,
        };
      } else {
        pad = {
          ...pad,
          isDraft: false,
          isDeployed: true,
        };
      }

      return (
        <Pad
          pad={pad}
          user={me}
          engineClient={this.props.engineClient}
          isDeploying={this.state.isDeploying}
          onDeploy={this.handleDeploy}
          onFork={this.handleFork}
          onForkDraft={this.handleForkDraft}
          onDownload={this.handleDownload}
          onReset={this.handleReset}
          onLogin={this.handleLogin}
          onLogout={this.handleLogout}
          onUpdateMetadata={this.handleUpdateMetadata}
        />
      );
    }
  }
}

const padFragments = gql`
  fragment PadFragment on Pad {
    id
    title
    description
    code
    url
    user {
      id
      githubUsername
    }
    context {
      key
      value
    }
    dependencies {
      name
      version
    }
    defaultQuery
    defaultVariables
    token
  }

  fragment PadFullFragment on Pad {
    ...PadFragment
    draft {
      ...PadFragment
    }
  }
`;

const meQuery = gql`
  query User {
    me {
      id
      githubUsername
    }
  }
`;

const padQuery = gql`
  query PadQuery($id: ID!) {
    pad: padById(id: $id) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const newPadQuery = gql`
  query NewPadQuery {
    pad: newPad {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const updatePadMutation = gql`
  mutation UpdatePad($pad: PadInput!) {
    pad: updatePad(pad: $pad) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const createPadMutation = gql`
  mutation CreatePad($pad: PadInputWithoutId!) {
    pad: createPad(pad: $pad) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const forkPadMutation = gql`
  mutation ForkPad($id: ID!) {
    pad: forkPad(id: $id) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const updateDraftMutation = gql`
  mutation UpdateDraft($pad: PadInput!) {
    pad: updateDraft(pad: $pad) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const deleteDraftMutation = gql`
  mutation DeleteDraft($id: ID!) {
    pad: deleteDraft(id: $id) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

const updateMetadataMutation = gql`
  mutation UpdateDefaultQuery(
    $id: ID!,
    $defaultQuery: String,
    $defaultVariables: String,
    $title: String,
    $description: String
  ) {
    pad: updatePadMetadata(input: {
      id: $id,
      defaultQuery: $defaultQuery,
      title: $title,
      description: $description
      defaultVariables: $defaultVariables,
    }) {
      ...PadFullFragment
    }
  }

  ${padFragments}
`;

export default compose(
  withApollo,
  graphql(meQuery, { name: 'meData' }),
  //Skip query if no id present
  graphql(padQuery, {
    name: 'padData',
    options: ({ id }) => ({ variables: { id } }),
    skip: ({ id }) => !id,
  }),
  //Skip new pad if id is present
  graphql(newPadQuery, {
    name: 'padData',
    skip: ({ id }) => (id ? true : false),
  }),
  graphql(updatePadMutation, { name: 'updatePad' }),
  graphql(createPadMutation, { name: 'createPad' }),
  graphql(forkPadMutation, { name: 'forkPad' }),
  graphql(updateDraftMutation, { name: 'updateDraft' }),
  graphql(deleteDraftMutation, { name: 'deleteDraft' }),
  graphql(updateMetadataMutation, { name: 'updateMetadata' }),
)(PadContainer);
