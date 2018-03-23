/* @flow */

import MongoProvider from './MongoProvider';
import WebtaskProvider from './WebtaskProvider';

export type User = {
  id: string,
  githubUsername: string,
  pads?: Array<Pad>,
};

export type Context = {
  key: string,
  value?: string,
};

export type Dependency = {
  name: string,
  version: ?string,
};

export type Pad = {
  id: string,
  title: ?string,
  description: ?string,
  code: ?string,
  deployedCode: ?string,
  url: ?string,
  user: ?User,
  context: ?Array<Context>,
  dependencies: ?Array<Dependency>,
  draft: ?Pad,
  defaultQuery: ?string,
  defaultVariables: ?string,
  token: ?string,
};

export type PadInput = {
  id: string,
  code: string,
  deployedCode: string,
  context: Array<Context>,
  dependencies: Array<string>,
};

export type PadMetadataInput = {
  id: string,
  title?: string,
  description?: string,
  defaultQuery?: string,
  defaultVariables?: string,
};

export type PadInputWithoutId = {
  code: string,
  deployedCode: string,
  context: Array<Context>,
  dependencies: Array<string>,
};

export type GraphQLContext = {
  mongo: MongoProvider,
  webtask: WebtaskProvider,
  user: ?User,
};
