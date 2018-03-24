/* @flow */

import React from 'react';
import HeaderDropdown from '../HeaderDropdown';
import renderer from 'react-test-renderer';

test('renders normal', () => {
  let component = renderer.create(
    <HeaderDropdown
      open={false}
      onClose={() => {}}
      button={<div>TestButton</div>}
    >
      <div>Content</div>
    </HeaderDropdown>,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <HeaderDropdown open onClose={() => {}} button={<div>TestButton</div>}>
      <div>Content</div>
    </HeaderDropdown>,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
