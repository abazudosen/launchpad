/* @flow */

import React from 'react';
import KeyValueEditor from '../KeyValueEditor.js';
import { mount } from 'enzyme';
import serializer from 'enzyme-to-json/serializer';

expect.addSnapshotSerializer(serializer);

test('renders', () => {
  const onChange = jest.fn();
  const component = mount(<KeyValueEditor value={[]} onChange={onChange} />);

  expect(component).toMatchSnapshot();

  component.setProps({
    value: [
      {
        key: 'test',
        value: 'bar',
      },
    ],
  });
  expect(component).toMatchSnapshot();

  component.setProps({
    value: [
      {
        key: 'test',
        value: 'bar',
      },
      {
        key: 'test2',
        value: 'baz',
      },
    ],
  });
  expect(component).toMatchSnapshot();

  component.setProps({
    value: [
      {
        key: 'test',
        value: 'bar',
      },
      {
        key: 'test2',
        value: '',
      },
    ],
  });
  expect(component).toMatchSnapshot();

  component.setProps({
    hilightEmpty: true,
  });
  expect(component).toMatchSnapshot();

  component.find('.KeyValueEditor-AddButton').simulate('click');
  expect(component).toMatchSnapshot();
  expect(onChange.mock.calls.length).toBe(1);

  component
    .find('.KeyValueEditor-Input')
    .first()
    .simulate('change', {
      currentTarget: { value: 'test ' },
    });
  expect(component).toMatchSnapshot();
  expect(onChange.mock.calls.length).toBe(2);
});
