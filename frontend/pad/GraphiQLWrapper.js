/* @flow */

import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import { parse, print } from 'graphql';
import type { Pad, User } from '../types';
import PadStorage from '../PadStorage';
import KeyValueEditor from '../modal/KeyValueEditor';
import Modal from '../modal/Modal';

import 'graphiql/graphiql.css';
import 'codemirror/theme/solarized.css';
import './GraphiQLWrapper.less';

const DEFAULT_QUERY = `# Welcome to GraphiQL

{
  hello
}
`;

type GraphiQLWrapperProps = {|
  pad: Pad,
  user: ?User,
  isDeploying: boolean,
  onSetDefaultQuery: (query: string, variables: string) => any,
|};

type Headers = Array<{ key: string, value?: string }>;

export default class GraphiQLWrapper extends Component {
  graphiql: any;
  props: GraphiQLWrapperProps;

  state: {
    fetcher?: any => any,
    headers: Headers,
    query: string,
    variables: string,
    headerModalOpen: boolean,
  };

  constructor(props: GraphiQLWrapperProps) {
    super(props);
    let fetcher;
    if (props.pad.url) {
      fetcher = createFetcher(props.pad.url, () => this.state.headers || []);
    }
    const query =
      PadStorage.getItem(props.pad.id, 'query') ||
      props.pad.defaultQuery ||
      DEFAULT_QUERY;
    const variables =
      PadStorage.getItem(props.pad.id, 'variables') ||
      props.pad.defaultVariables ||
      '';
    const storedHeaders = PadStorage.getItem(props.pad.id, 'headers');
    let headers = [];
    if (storedHeaders) {
      try {
        headers = JSON.parse(storedHeaders);
      } catch (e) {
        PadStorage.deleteItem(props.pad.id, 'headers');
      }
    }
    this.state = {
      fetcher,
      headers,
      query,
      variables,
      headerModalOpen: false,
    };
  }

  componentWillReceiveProps(nextProps: GraphiQLWrapperProps) {
    if (
      this.props.pad.url !== nextProps.pad.url ||
      (this.props.isDeploying && !nextProps.isDeploying)
    ) {
      this.setState(
        {
          fetcher: createFetcher(
            nextProps.pad.url,
            () => this.state.headers || [],
          ),
        },
        () => {
          const editor = this.graphiql.getQueryEditor();
          const currentText = editor.getValue();
          try {
            if (!isMutation(currentText)) {
              this.graphiql.handleRunQuery();
            }
          } catch (e) {
            console.error(e);
          }
        },
      );
    }
  }

  handleHeaderChange = (headers: Headers) => {
    this.setState({
      headers,
    });
    PadStorage.setItem(this.props.pad.id, 'headers', JSON.stringify(headers));
  };

  handlePrettify = () => {
    const editor = this.graphiql.getQueryEditor();
    editor.setValue(print(parse(editor.getValue())));
  };

  handleQueryChange = (query: string) => {
    this.setState({
      query,
    });
    PadStorage.setItem(this.props.pad.id, 'query', query);
  };

  handleVariablesChange = (variables: string) => {
    this.setState({
      variables,
    });
    PadStorage.setItem(this.props.pad.id, 'variables', variables);
  };

  handleSetDefaultQuery = () => {
    this.props.onSetDefaultQuery(this.state.query, this.state.variables);
  };

  handleResetQuery = () => {
    this.handleQueryChange(this.props.pad.defaultQuery || DEFAULT_QUERY);
    if (this.props.pad.defaultVariables) {
      this.handleVariablesChange(this.props.pad.defaultVariables);
    }
  };

  handleModalOpen = () => {
    this.setState({
      headerModalOpen: true,
    });
  };

  handleModalClose = () => {
    this.setState({
      headerModalOpen: false,
    });
  };

  renderLoading() {
    if (this.props.isDeploying) {
      return (
        <div className="GraphiQLWrapper-LoadingIndicator">Updating...</div>
      );
    } else {
      return null;
    }
  }

  renderGraphiQL() {
    if (this.state.fetcher) {
      return (
        <GraphiQL
          ref={el => (this.graphiql = el)}
          fetcher={this.state.fetcher}
          editorTheme="solarized"
          query={this.state.query}
          variables={this.state.variables}
          onEditQuery={this.handleQueryChange}
          onEditVariables={this.handleVariablesChange}
        >
          <GraphiQL.Toolbar>
            <GraphiQL.Button label="Prettify" onClick={this.handlePrettify} />
            <div className="graphiql-button-group">
              <GraphiQL.Button
                label="Save"
                title="Set this query as default query for this pad"
                onClick={this.handleSetDefaultQuery}
              />
              <GraphiQL.Button
                label="Reset"
                title="Reset query to the default one for this tab"
                onClick={this.handleResetQuery}
              />
              <GraphiQL.Button
                label="Headers"
                title="Edit headers sent with the GraphQL query"
                onClick={this.handleModalOpen}
              />
              <Modal
                isOpen={this.state.headerModalOpen}
                onRequestClose={this.handleModalClose}
                title="GraphiQL Request Headers"
              >
                <KeyValueEditor
                  value={this.state.headers}
                  onChange={this.handleHeaderChange}
                />
              </Modal>
            </div>
          </GraphiQL.Toolbar>
        </GraphiQL>
      );
    } else {
      return (
        <div className="GraphiQLWrapper-NoGraphiQL">
          GraphiQL will appear here after you deploy the code
        </div>
      );
    }
  }

  render() {
    return (
      <div className="GraphiQLWrapper">
        {this.renderLoading()}
        {this.renderGraphiQL()}
      </div>
    );
  }
}

function createFetcher(url: string, getHeaders: () => Headers) {
  return graphQLParams => {
    let headers = {};
    getHeaders().forEach(({ key, value }) => {
      if (key && key.length > 0) {
        headers[key] = value || '';
      }
    });
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  };
}

function isMutation(query) {
  const ast = parse(query);
  return ast.definitions.some(
    definition =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation',
  );
}
