/* @flow */

import React from 'react';
import Modal from '../Modal';
import renderer from 'react-test-renderer';

test('renders normal', () => {
  const component = renderer.create(
    <Modal title="Test" onRequestClose={() => {}}>
      <div>Test</div>
    </Modal>,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
