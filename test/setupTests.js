/* @flow */

if(window && window.navigator)
  Object.defineProperty(window.navigator, 'userAgent', {value: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2'});

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
