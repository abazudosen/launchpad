/* @flow */

import React from 'react';
import TitleEditor from '../TitleEditor';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import serializer from 'enzyme-to-json/serializer';

expect.addSnapshotSerializer(serializer);

test('render normal', () => {
  let component = renderer.create(
    <TitleEditor
      title="Test"
      githubUsername="example"
      canEdit={true}
      onSetTitle={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <TitleEditor
      title="Test"
      githubUsername="example"
      canEdit={false}
      onSetTitle={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <TitleEditor
      title={null}
      githubUsername="example"
      canEdit={true}
      onSetTitle={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    <TitleEditor
      title={null}
      githubUsername={null}
      canEdit={true}
      onSetTitle={() => {}}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('interaction', () => {
  const onSetTitle = jest.fn();
  const component = mount(
    <TitleEditor
      title="test"
      githubUsername="example"
      canEdit={true}
      onSetTitle={onSetTitle}
    />,
  );
  expect(component).toMatchSnapshot();

  component
    .find('.TitleInput')
    .simulate('change', { target: { value: 'New test' } });
  expect(component).toMatchSnapshot();

  component.find('.TitleInput').simulate('blur');
  expect(onSetTitle.mock.calls.length).toBe(1);

  component
    .find('.TitleInput')
    .simulate('change', { target: { value: 'New test 2' } });
  expect(component).toMatchSnapshot();

  component.find('.TitleInput').simulate('keyPress', { key: 'Enter' });
  expect(onSetTitle.mock.calls.length).toBe(2);
});
