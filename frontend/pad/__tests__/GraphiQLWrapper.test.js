/* @flow */

import React from 'react';
import GraphiQLWrapper from '../GraphiQLWrapper';
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

test('renders normal', () => {
  const component = renderer.render(
    <GraphiQLWrapper
      pad={testPad}
      user={testUser}
      isDeploying={false}
      onSetDefaultQuery={() => {}}
    />,
  );
  expect(component).toMatchSnapshot();
});

test('renders deploying', () => {
  const component = renderer.render(
    <GraphiQLWrapper
      pad={testPad}
      user={testUser}
      isDeploying={true}
      onSetDefaultQuery={() => {}}
    />,
  );
  expect(component).toMatchSnapshot();
});
