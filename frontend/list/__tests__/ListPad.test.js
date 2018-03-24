/* @flow */

import React from 'react';
import ListPad from '../ListPad';
import renderer from 'react-test-renderer';

test('renders normal', () => {
  const component = renderer.create(
    <ListPad
      pad={{
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
      }}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
