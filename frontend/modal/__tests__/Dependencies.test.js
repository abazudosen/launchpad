/* @flow */

import React from 'react';
import Dependencies from '../Dependencies';
import renderer from 'react-test-renderer';

test('renders empty', () => {
  const component = renderer.create(<Dependencies dependencies={[]} />);
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders non-empty', () => {
  const component = renderer.create(
    <Dependencies
      dependencies={[
        {
          name: 'graphql',
          version: '0.9.1S,',
        },
        {
          name: 'grahpql-tools',
          version: '1.0.0',
        },
      ]}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
