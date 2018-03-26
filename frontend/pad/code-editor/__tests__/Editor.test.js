/* @flow */

import React from 'react';
import Editor from '../Editor.js';
import { mount } from 'enzyme';
import serializer from 'enzyme-to-json/serializer';
import { STARTER_CODE } from '../../../../server/code';

// This is not a very useful test

jest.mock('react-codemirror');
jest.mock('../EditorLinter');

expect.addSnapshotSerializer(serializer);

describe('Code Editor', () => {
  test('renders', () => {
    const component = mount(
      <Editor code={STARTER_CODE} canEdit={true} onChange={() => {}} />,
    );

    expect(component).toMatchSnapshot();
  });
});
