/* @flow */

/**
 * @jest-environment node
 */

import React from 'react';
import UserBar from '../UserBar';
import { mount } from 'enzyme';
import serializer from 'enzyme-to-json/serializer';

expect.addSnapshotSerializer(serializer);

describe('User Bar', () => {
  test('renders normal', () => {
    const component = mount(
      <UserBar
        user={{
          id: 'test-id',
          githubUsername: 'example',
          pads: [],
        }}
        onLogin={() => {}}
        onLogout={() => {}}
      />,
    );
    expect(component).toMatchSnapshot();

    component.find('HeaderButton').simulate('click');
    expect(component).toMatchSnapshot();

    component.find('HeaderButton').simulate('click');
    expect(component).toMatchSnapshot();
  });
});
