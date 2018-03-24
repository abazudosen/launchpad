import jwt from 'jsonwebtoken';
import { createServer as createHttpServer, Server } from 'http';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import createServer from '../createServer';
import { createTestDatabaseName } from './utils/testUtils';

const api = 'https://wt-launchpad.it.auth0.com/api';
const container = 'launchpad-test';
const token =
  'eyJhbGciOiJIUzI1NiIsImtpZCI6ImxhdW5jaHBhZC0xIn0.eyJqdGkiOiIzNzY5MjA2YmY3YjM0YTI1ODRkMzlhOTk2MDdjZGJmNSIsImlhdCI6MTQ5OTI1NjczMSwiZHIiOjEsImNhIjpbImZmMTQ3MzQ2Mzc2OTQzZjFhMDdiZDJkMjQ5MmJlM2U5Il0sImRkIjoyLCJ0ZW4iOiJsYXVuY2hwYWQtdGVzdCJ9.U9XxBHTUIvMw4WnDq-S0ACAq6F9z8-XehFqAfMbwD60';
const secret =
  'mKVFmMkznAG2L5HXgizAaqCP5HrTtYePwbDDYIhkNJAeYwWHcmH8Wt93S1lwYYQ';

let server: Server;
let mongoUrl: string;
let port: string | number;
let createdIds: Array<string> = [];

const userToken:string = jwt.sign(
  {
    sub: 'test-user',
    nickname: 'testUsername',
  },
  secret,
);

async function queryServer(query: string, variables: Record<string, any>, token: string) {
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

async function queryHello(url: string) {
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

describe("createServer", () => {
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
    await mongo.dropDatabase();
    for (const id of createdIds) {
      const result = await fetch(`${api}/webtask/launchpad-test/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!result.ok) {
        console.log(`failed to delete pad ${id}, ${await result.text()}`);
      }
    }
  });

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

  //TODO: when Auth0 figures out their peerDep story, can remove launchpad-module
  //var _graphqlTools = require('graphql-tools');
  var _graphqlTools = require('launchpad-module').graphqlTools;
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
    let padId:string;
    it('get own profile', async () => {
      const result = await queryServer(`query { me { id }}`, {}, '');
      expect(result).toEqual({
        data: {
          me: null,
        },
      });
    });

    it('get empty pad', async () => {
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

    it('push draft', async () => {
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
            id: padId as string,
            code: 'someCode',
            deployedCode: testDeployedCode,
            context: [],
            //TODO: when Auth0 figures out their peerDep story, can remove launchpad-module
            dependencies: ['graphql-tools', 'launchpad-module'],
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
      });
      createdIds.push(`${padId}_draft`);
    });

    it('login', async () => {
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

    it('save pad', async () => {
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
            //TODO: when Auth0 figures out their peerDep story, can remove launchpad-module
            dependencies: ['graphql-tools', 'launchpad-module'],
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
      });
      createdIds.push(`${pad.id}_depl`);
    });

    it('fork pad', async () => {
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
      });
      createdIds.push(`${pad.id}_depl`);
    });

    it('get own pads', async () => {
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
});
