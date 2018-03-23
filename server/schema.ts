/* @flow */

import { makeExecutableSchema } from 'graphql-tools';
import type {
  User,
  Pad,
  PadInput,
  PadInputWithoutId,
  PadMetadataInput,
  GraphQLContext,
} from './types';
import UserModel from './UserModel';
import PadModel from './PadModel';

const typeDefs = `
  type User {
    id: String!
    githubUsername: String
    pads: [Pad]
  }

  type Context {
    key: String!
    value: String
  }

  type Dependency {
    name: String!
    version: String
  }

  type Pad {
    id: ID!
    title: String
    description: String
    code: String
    deployedCode: String
    url: String
    user: User
    dependencies: [Dependency]
    context: [Context],
    draft: Pad
    defaultQuery: String
    defaultVariables: String
    token: String
  }

  input ContextInput {
    key: String!
    value: String!
  }

  input PadInput {
    id: ID
    code: String!
    deployedCode: String!
    context: [ContextInput]
    dependencies: [String]
  }

  input PadMetadataInput {
    id: ID!
    title: String
    description: String
    defaultQuery: String
    defaultVariables: String
  }

  input PadInputWithoutId {
    code: String!
    deployedCode: String!
    context: [ContextInput]
    dependencies: [String]
  }

  type Query {
    me: User
    newPad: Pad
    padById(id: ID!): Pad
  }

  type Mutation {
    createPad(pad: PadInputWithoutId!): Pad
    updatePad(pad: PadInput!): Pad
    forkPad(id: ID!): Pad
    updateDraft(pad: PadInput!): Pad
    deleteDraft(id: ID!): Pad
    updatePadMetadata(input: PadMetadataInput!): Pad
  }
`;

type Resolver<Type> = {
  [Key: $Keys<Type>]: (
    root: Type,
    args: any,
    context: GraphQLContext,
  ) => Promise<any>, // this in future can actually be typed by key
};

type Resolvers = {
  Query: Resolver<any>,
  Mutation: Resolver<any>,
  User: Resolver<User>,
};

const resolvers: Resolvers = {
  Query: {
    async me(_, args: any, context: GraphQLContext): Promise<?User> {
      return UserModel.me(context);
    },

    async newPad(_, context: GraphQLContext) {
      return PadModel.empty(context);
    },

    async padById(
      _,
      { id }: { id: string },
      context: GraphQLContext,
    ): Promise<Pad> {
      const pad = await PadModel.getById(id, context);
      if (pad) {
        return pad;
      } else {
        throw new Error('Pad not found');
      }
    },
  },

  Mutation: {
    async createPad(
      _,
      { pad }: { pad: PadInputWithoutId },
      context: GraphQLContext,
    ): Promise<Pad> {
      const result = await PadModel.create(pad, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },

    async updatePad(
      _,
      { pad }: { pad: PadInput },
      context: GraphQLContext,
    ): Promise<Pad> {
      const result = await PadModel.update(pad, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },

    async forkPad(_, { id, pad }: { id: string }, context: GraphQLContext) {
      const result = await PadModel.fork(id, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },

    async updateDraft(
      _,
      { pad }: { pad: PadInput },
      context: GraphQLContext,
    ): Promise<Pad> {
      const result = await PadModel.updateDraft(pad, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },

    async deleteDraft(_, { id }: { id: string }, context): Promise<Pad> {
      const result = await PadModel.deleteDraft(id, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },

    async updatePadMetadata(
      _,
      { input }: { input: PadMetadataInput },
      context,
    ): Promise<Pad> {
      const result = await PadModel.updatePadMetadata(input, context);
      if (result.ok) {
        return result.pad;
      } else {
        throw new Error(result.reason);
      }
    },
  },

  User: {
    async pads(user, args, context): Promise<Array<Pad>> {
      const currentUser = UserModel.me(context);
      if (currentUser && user.id === currentUser.id) {
        return PadModel.listMyPads(context);
      } else {
        return [];
      }
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
