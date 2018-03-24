/* @flow */

import React from 'react';
import HeaderButton from '../HeaderButton';
import renderer from 'react-test-renderer';

test('renders normal', () => {
  let component = renderer.create(
    <HeaderButton onClick={() => {}}>
      <div>Content</div>
    </HeaderButton>,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <HeaderButton active onClick={() => {}}>
      <div>Content</div>
    </HeaderButton>,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <HeaderButton disabled onClick={() => {}}>
      <div>Content</div>
    </HeaderButton>,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <HeaderButton tooltip={<div>Tooltip</div>} onClick={() => {}}>
      <div>Content</div>
    </HeaderButton>,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
