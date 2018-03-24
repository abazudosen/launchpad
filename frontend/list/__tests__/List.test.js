/* @flow */

import React from 'react';
import List from '../List';
import ReactShallowRenderer from 'react-test-renderer/shallow';

const renderer = new ReactShallowRenderer();

test('renders empty', () => {
  const user = {
    id: 'test-ids',
    githubUsername: 'example',
    pads: [],
  };
  const component = renderer.render(<List user={user} onLogout={() => {}} />);
  expect(component).toMatchSnapshot();
});

test('renders full', () => {
  const user = {
    id: 'test-ids',
    githubUsername: 'example',
    pads: [
      {
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
      },
      {
        id: 'fakeid2',
        title: 'Fake 2',
        description: 'Description 2',
        code: 'code 2',
        deployedCode: 'deployed code 2',
        url: 'http://example.com/2',
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
      },
    ],
  };
  const component = renderer.render(
    <List
      user={{
        ...user,
        pad: [{}],
      }}
      onLogout={() => {}}
    />,
  );
  expect(component).toMatchSnapshot();
});
