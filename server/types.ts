import MongoProvider from './MongoProvider';
import WebtaskProvider from './WebtaskProvider';

export type User = {
  id: string,
  githubUsername: string,
  pads?: Array<Pad> | null,
};

export type Context = {
  key: string,
  value?: string | null,
};

export type Dependency = {
  name: string,
  version?: string | null,
};

export type Pad = {
  id: string,
  title?: string | null,
  description?: string | null,
  code?: string | null,
  deployedCode?: string | null,
  url?: string | null,
  user: User | null,
  context?: Array<Context> | null,
  dependencies?: Array<Dependency> | null,
  draft?: Pad | null,
  defaultQuery?: string | null,
  defaultVariables?: string | null,
  token?: string | null,
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
  title?: string | null,
  description?: string | null,
  defaultQuery?: string | null,
  defaultVariables?: string | null,
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
  user?: User | null,
};
