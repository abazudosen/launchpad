/* @flow */

/**
 * @jest-environment node
 */

import jwt from 'jsonwebtoken';
import { createServer as createHttpServer } from 'http';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import createServer from '../createServer';
import { createTestDatabaseName } from '../../test/testUtils';

/* global jasmine */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

const api = 'https://wt-launchpad.it.auth0.com/api';
const container = 'launchpad-test';
const token =
  'eyJhbGciOiJIUzI1NiIsImtpZCI6ImxhdW5jaHBhZC0xIn0.eyJqdGkiOiIzNzY5MjA2YmY3YjM0YTI1ODRkMzlhOTk2MDdjZGJmNSIsImlhdCI6MTQ5OTI1NjczMSwiZHIiOjEsImNhIjpbImZmMTQ3MzQ2Mzc2OTQzZjFhMDdiZDJkMjQ5MmJlM2U5Il0sImRkIjoyLCJ0ZW4iOiJsYXVuY2hwYWQtdGVzdCJ9.U9XxBHTUIvMw4WnDq-S0ACAq6F9z8-XehFqAfMbwD60';
const secret =
  'mKVFmMkznAG2L5HXgizAaqCP5HrTtYePwbDDYIhkNJAeYwWHcmH8Wt93S1lwYYQ';
let server;
let mongoUrl;
let port;
let createdIds = [];
const userToken = jwt.sign(
  {
    sub: 'test-user',
    nickname: 'testUsername',
  },
  secret,
);

beforeAll(async () => {
  const baseMongoUrl =
    process.env.TEST_MONGODB_URL || 'mongodb://127.0.0.1:27017';
  mongoUrl = `${baseMongoUrl}/${createTestDatabaseName()}`;
  const options = {
    WT_TOKEN: token,
    WT_API: api,
    MONGODB_URL: mongoUrl,
    WT_NO_PROXY: '1',
    WT_SINGLE_TENANT_CONTAINER: container,
    AUTH0_SECRET: secret,
  };
  const app = createServer(options);
  port = process.env.TEST_PORT || 8888;
  server = createHttpServer(app);
  await new Promise(resolve =>
    server.listen(
      {
        port,
        host: 'localhost',
      },
      () => resolve(),
    ),
  );
});

afterAll(async () => {
  await new Promise(resolve => server.close(() => resolve()));
  const mongo = await MongoClient.connect(mongoUrl);
  await mongo.mongodb.dropDatabase();
  for (const id of createdIds) {
    const result = await fetch(`${api}/launchpad-test/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!result.ok) {
      console.log(await result.text());
    }
  }
});

async function queryServer(query, variables, token) {
  const result = await fetch(`http://localhost:${port}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer: ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  return result.json();
}

async function queryHello(url) {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: '{ hello }',
    }),
  });
  return result.json();
}

const padFragments = `
  fragment PadFragment on Pad {
    id
    title
    description
    code
    url
    user {
      id
      githubUsername
    }
    context {
      key
      value
    }
    dependencies {
      name
      version
    }
    defaultQuery
    defaultVariables
    token
  }

  fragment PadFullFragment on Pad {
    ...PadFragment
    draft {
      ...PadFragment
    }
  }
`;

const testDeployedCode = `
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = undefined;

var _graphqlTools = require('graphql-tools');
var typeDefs = 'type Query { hello: String }';
var resolvers = {
  Query: {
    hello: function hello(root, args, context) {
      return 'Hello world!';
    }
  }
};

// Required: Export the GraphQL.js schema object as "schema"
var schema = exports.schema = _graphqlTools.makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers
});
`;

describe('integration lifecycle test', () => {
  let padId;
  test('get own profile', async () => {
    const result = await queryServer(`query { me { id }}`, {}, '');
    expect(result).toEqual({
      data: {
        me: null,
      },
    });
  });

  test('get empty pad', async () => {
    const result = await queryServer(
      `
      query {
        newPad {
        ...PadFullFragment
        }
      }
      ${padFragments}
      `,
      {},
      '',
    );
    const pad = result.data.newPad;
    padId = pad.id;
    expect(padId).not.toBeNull();

    expect(pad.code).not.toBeNull();
    expect(pad.user).toBeNull();
    expect(pad.url).toBeNull();
  });

  test('push draft', async () => {
    const result = await queryServer(
      `
      mutation UpdateDraft($pad: PadInput!) {
        updateDraft(pad: $pad) {
          ...PadFullFragment
        }
      }

      ${padFragments}
      `,
      {
        pad: {
          id: padId,
          code: 'someCode',
          deployedCode: testDeployedCode,
          context: [],
          dependencies: ['graphql-tools'],
        },
      },
      '',
    );
    const pad = result.data.updateDraft.draft;
    expect(pad.url).not.toBeNull();
    const deployedResult = await queryHello(pad.url);
    expect(deployedResult).toEqual({
      data: {
        hello: 'Hello world!',
      },
      extensions: {},
    });
    createdIds.push(`${padId}_draft`);
  });

  test('login', async () => {
    const result = await queryServer(
      `query { me { id, githubUsername }}`,
      {},
      userToken,
    );
    expect(result).toEqual({
      data: {
        me: {
          id: 'test-user',
          githubUsername: 'testUsername',
        },
      },
    });
  });

  test('save pad', async () => {
    const result = await queryServer(
      `
      mutation UpdatePad($pad: PadInput!) {
        updatePad(pad: $pad) {
          ...PadFullFragment
        }
      }

      ${padFragments}
      `,
      {
        pad: {
          id: padId,
          code: 'someCode',
          deployedCode: testDeployedCode,
          context: [],
          dependencies: ['graphql-tools'],
        },
      },
      userToken,
    );
    const pad = result.data.updatePad;
    expect(pad.draft).toBeNull();
    expect(pad.url).not.toBeNull();
    const deployedResult = await queryHello(pad.url);
    expect(deployedResult).toEqual({
      data: {
        hello: 'Hello world!',
      },
      extensions: {},
    });
    createdIds.push(`${pad.id}_depl`);
  });

  test('fork pad', async () => {
    const result = await queryServer(
      `
      mutation ForkPad {
        forkPad(id: "${padId}") {
          ...PadFullFragment
        }
      }

      ${padFragments}
      `,
      {},
      userToken,
    );
    const pad = result.data.forkPad;
    expect(pad.draft).toBeNull();
    expect(pad.url).not.toBeNull();
    const deployedResult = await queryHello(pad.url);
    expect(deployedResult).toEqual({
      data: {
        hello: 'Hello world!',
      },
      extensions: {},
    });
    createdIds.push(`${pad.id}_depl`);
  });

  test('get own pads', async () => {
    const getResult = await queryServer(
      `
      query {
        padById(id: "${padId}") {
          ...PadFullFragment
        }
      }

      ${padFragments}
      `,
      {},
      userToken,
    );

    expect(getResult.data.padById.id).toBe(padId);

    const listResult = await queryServer(
      `
        query {
          me {
            pads {
              id
            }
          }
        }
      `,
      {},
      userToken,
    );
    expect(listResult.data.me.pads.length).toBe(2);
  });
});
