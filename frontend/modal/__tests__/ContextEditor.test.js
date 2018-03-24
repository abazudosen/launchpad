/* @flow */

import React from 'react';
import ContextEditor from '../ContextEditor';
import renderer from 'react-test-renderer';

test('renders empty', () => {
  const component = renderer.create(
    <ContextEditor context={[]} onChange={() => {}} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders hidden', () => {
  const component = renderer.create(
    <ContextEditor
      context={[
        {
          key: 'test',
        },
        {
          key: 'test2',
        },
      ]}
      onChange={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders normal', () => {
  const component = renderer.create(
    <ContextEditor
      context={[
        {
          key: 'test',
          value: 'value',
        },
        {
          key: 'test2',
          value: 'value2',
        },
      ]}
      onChange={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
