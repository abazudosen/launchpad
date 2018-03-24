/* @flow */

import React from 'react';
import Header from '../Header.js';
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

function renderHeader({ user, pad, isDraft, isDeployed, isDeploying }) {
  return (
    <Header
      user={user}
      pad={{
        ...pad,
        isDraft,
        isDeployed,
      }}
      engineClient={{}}
      currentContext={[]}
      onContextChange={() => {}}
      isDeploying={isDeploying}
      onDeploy={() => {}}
      onReset={() => {}}
      onFork={() => {}}
      onDownload={() => {}}
      onLogin={() => {}}
      onLogout={() => {}}
      onSetTitle={() => {}}
      onSetDescription={() => {}}
    />
  );
}

test('renders anon existing', () => {
  const component = renderer.render(
    renderHeader({
      user: null,
      pad: testPad,
      isDraft: false,
      isDeployed: true,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('renders anon new', () => {
  const component = renderer.render(
    renderHeader({
      user: null,
      pad: {
        ...testPad,
        user: null,
      },
      isDraft: false,
      isDeployed: false,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('renders own', () => {
  const component = renderer.render(
    renderHeader({
      user: testUser,
      pad: testPad,
      isDraft: false,
      isDeployed: true,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('renders deploying', () => {
  const component = renderer.render(
    renderHeader({
      user: testUser,
      pad: testPad,
      isDraft: true,
      isDeployed: true,
      isDeploying: true,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('renders undeployed', () => {
  const component = renderer.render(
    renderHeader({
      user: testUser,
      pad: testPad,
      isDraft: false,
      isDeployed: false,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('renders draft', () => {
  const component = renderer.render(
    renderHeader({
      user: testUser,
      pad: testPad,
      isDraft: true,
      isDeployed: true,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});

test('render others', () => {
  const component = renderer.render(
    renderHeader({
      user: testUser,
      pad: {
        ...testPad,
        user: {
          id: 'some-new-id',
          githubUsername: 'some-new-username',
          pads: [],
        },
      },
      isDraft: false,
      isDeployed: true,
      isDeploying: false,
    }),
  );
  expect(component).toMatchSnapshot();
});
