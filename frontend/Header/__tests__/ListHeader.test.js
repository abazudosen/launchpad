/* @flow */

import React from 'react';
import ListHeader from '../ListHeader.js';
import ReactShallowRenderer from 'react-test-renderer/shallow';

const renderer = new ReactShallowRenderer();

test('renders normal', () => {
  const component = renderer.render(
    <ListHeader
      user={{
        id: 'test-id',
        githubUsername: 'example',
        pads: [],
      }}
      onLogout={() => {}}
    />,
  );
  expect(component).toMatchSnapshot();
});
