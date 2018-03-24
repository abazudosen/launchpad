/* @flow */

import React from 'react';
import Footer from '../Footer';
import renderer from 'react-test-renderer';

function renderFooter({ isDraft, isDeployed, canSeeLogs, url, error }) {
  return (
    <Footer
      {...{ isDraft, isDeployed, canSeeLogs, url, error }}
      isLogOpen={false}
      onResetLinkClick={() => {}}
      onLogOpen={() => {}}
      onLogClose={() => {}}
      onModalOpen={() => {}}
    />
  );
}

test('renders normal', () => {
  let component = renderer.create(
    renderFooter({
      isDraft: false,
      isDeployed: true,
      canSeeLogs: true,
      url: 'http://example.com',
      error: null,
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    renderFooter({
      isDraft: false,
      isDeployed: true,
      canSeeLogs: false,
      url: 'http://example.com',
      error: null,
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders draft', () => {
  let component = renderer.create(
    renderFooter({
      isDraft: true,
      isDeployed: true,
      canSeeLogs: true,
      url: 'http://example.com',
      error: null,
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    renderFooter({
      isDraft: true,
      isDeployed: false,
      canSeeLogs: true,
      url: 'http://example.com',
      error: null,
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders undeployed', () => {
  const component = renderer.create(
    renderFooter({
      isDraft: true,
      isDeployed: false,
      canSeeLogs: false,
      url: 'http://example.com',
      error: 'error',
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('renders error', () => {
  let component = renderer.create(
    renderFooter({
      isDraft: true,
      isDeployed: true,
      canSeeLogs: true,
      url: 'http://example.com',
      error: 'error',
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    renderFooter({
      isDraft: false,
      isDeployed: false,
      canSeeLogs: true,
      url: 'http://example.com',
      error: 'error',
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();

  component = renderer.create(
    renderFooter({
      isDraft: false,
      isDeployed: true,
      canSeeLogs: true,
      url: 'http://example.com',
      error: 'error',
    }),
  );
  expect(component.toJSON()).toMatchSnapshot();
});
