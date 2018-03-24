/* @flow */

import React from 'react';
import PadSplit from '../PadSplit.js';
import ReactShallowRenderer from 'react-test-renderer/shallow';

const renderer = new ReactShallowRenderer();

const testPad = {
  id: 'fakeid1',
  title: 'Fake 1',
  description: 'Description 1',
  code: 'code',
  deployedCode: 'deployed code',
  url: 'http://example.com',
  user: {
    id: 'test-ids',
    githubUsername: 'example',
    pads: [],
  },
  context: [
    {
      key: 'secret',
      value: 'secret',
    },
  ],
  dependencies: [
    {
      name: 'graphql-js',
      version: '0.8.9',
    },
  ],
  defaultQuery: '{ hello }',
  defaultVariables: null,
  token: 'test-token-2',
  draft: null,
};

const testUser = testPad.user;

function renderPadSplit({
  pad,
  user,
  currentCode,
  currentContext,
  isDeploying,
  error,
}) {
  return (
    <PadSplit
      pad={pad}
      user={user}
      engineClient={{}}
      currentCode={currentCode}
      currentContext={currentContext}
      isDeploying={isDeploying}
      error={error}
      onDeploy={() => {}}
      onReset={() => {}}
      onFork={() => {}}
      onCodeChange={() => {}}
      onContextChange={() => {}}
      onLogin={() => {}}
      onLogout={() => {}}
      onSetTitle={() => {}}
      onSetDescription={() => {}}
      onSetDefaultQuery={() => {}}
      onDownload={() => {}}
    />
  );
}

test('render normally', () => {
  const component = renderer.render(
    renderPadSplit({
      pad: testPad,
      user: testUser,
      currentCode: 'test',
      currentContext: [{ key: 'test', value: 'testValue' }],
      isDeploying: false,
      error: null,
    }),
  );

  expect(component).toMatchSnapshot();
});
