/* @flow */

import React from 'react';
import HeaderLogo from '../HeaderLogo';
import renderer from 'react-test-renderer';

test('renders normal', () => {
  const component = renderer.create(<HeaderLogo />);
  expect(component.toJSON()).toMatchSnapshot();
});
