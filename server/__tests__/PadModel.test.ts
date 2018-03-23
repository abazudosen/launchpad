/* @flow */

/**
 * @jest-environment node
 */

import PadModel from '../PadModel';
import type { Pad, User, GraphQLContext } from '../types';
import {
  createTestContext,
  createTestDatabaseName,
} from '../../test/testUtils';

let testContext: GraphQLContext;
let mongoUrl;

const user: User = {
  id: 'fakeuserid',
  githubUsername: 'example',
};

const ownPad: Pad = {
  id: 'fakeid1',
  title: 'Fake 1',
  description: 'Description 1',
  code: 'code',
  deployedCode: 'deployed code',
  url: 'http://example.com',
  user: user,
  context: [
    {
      key: 'secret',
      value: 'secret',
    },
  ],
  dependencies: [
    {
      name: 'graphql-js',
      version: '0.8.9',
    },
  ],
  defaultQuery: '{ hello }',
  defaultVariables: null,
  token: 'test-token-2',
  draft: null,
};

const otherPad = {
  id: 'fakeid2',
  title: 'Fake 2',
  description: 'Description 1',
  code: 'code',
  deployedCode: 'deployed code',
  url: 'http://example.com',
  user: {
    id: 'some-other-user',
    githubUsername: 'example2',
  },
  context: [
    {
      key: 'secret',
      value: 'secret',
    },
  ],
  dependencies: [
    {
      name: 'graphql',
      version: '0.8.9',
    },
  ],
  defaultQuery: '{ hello }',
  defaultVariables: null,
  token: 'test-token-2',
  draft: {
    id: 'test_draft',
    code: 'test',
    deployedCode: 'testdelpoyed',
    url: 'http://draft.example.com',
    user: {
      id: 'some-other-user',
      githubUsername: 'example2',
    },
    context: [
      {
        key: 'secret',
        value: 'secret',
      },
    ],
    dependencies: [
      {
        name: 'graphql',
        version: '0.8.9',
      },
    ],
    title: null,
    description: null,
    defaultQuery: null,
    defaultVariables: null,
    draft: null,
    token: null,
  },
};

beforeAll(async () => {
  let baseMongoUrl =
    process.env.TEST_MONGODB_URL || 'mongodb://127.0.0.1:27017';
  mongoUrl = `${baseMongoUrl}/${createTestDatabaseName()}`;
  testContext = ((createTestContext(mongoUrl): any): GraphQLContext);
  await (await testContext.mongo.mongodb)
    .collection('Pads')
    .insertMany([{ ...ownPad }, { ...otherPad }]);
});

afterAll(async () => {
  if (testContext.mongo) {
    await testContext.mongo.mongodb.dropDatabase();
  }
});

test('sensitive data is filtered', () => {
  const userContext = {
    ...testContext,
    user,
  };

  const filteredOwnPad = PadModel.filter(ownPad, userContext);
  expect(filteredOwnPad).toEqual(ownPad);

  const filteredOtherPad = PadModel.filter(otherPad, userContext);
  expect(filteredOtherPad.token).toBeNull();
  expect(filteredOtherPad.draft).toBeNull();
  expect(filteredOtherPad.context).toEqual([{ key: 'secret' }]);

  const filteredAnonymous = PadModel.filter(ownPad, testContext);
  expect(filteredAnonymous.token).toBeNull();
  expect(filteredAnonymous.draft).toBeNull();
  expect(filteredAnonymous.context).toEqual([{ key: 'secret' }]);
});

test('empty pad', () => {
  expect(PadModel.empty(testContext)).toMatchSnapshot();
});

test('pad is retrieved', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const pad = await PadModel.getById('fakeid1', userContext);
  expect(pad).toEqual(ownPad);
});

test('own pads are retrived', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const pads = await PadModel.listMyPads(userContext);
  expect(pads).toEqual([ownPad]);
});

test('pad is created without id', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const result = await PadModel.create(
    {
      code: 'testCode',
      deployedCode: 'testDeployedCode',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    userContext,
  );

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.pad.code).toBe('testCode');
    expect(result.pad.deployedCode && result.pad.deployedCode).toBe(
      'testDeployedCode',
    );
    expect(result.pad.context).toEqual([
      {
        key: 'secret',
        value: 'secret',
      },
    ]);
    expect(
      result.pad.dependencies &&
        result.pad.dependencies.map(({ name }) => name),
    ).toEqual(['graphql', 'graphql-tools']);
    expect(result.pad.id).toBeDefined();
    expect(result.pad.url).toBeDefined();
    expect(result.pad.token).toBeDefined();
  }
});

test('pad is created with id', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const result = await PadModel.update(
    {
      id: 'newid1',
      code: 'testCode',
      deployedCode: 'testDeployedCode',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    userContext,
  );

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.pad.code).toBe('testCode');
    expect(result.pad.deployedCode && result.pad.deployedCode).toBe(
      'testDeployedCode',
    );
    expect(result.pad.context).toEqual([
      {
        key: 'secret',
        value: 'secret',
      },
    ]);
    expect(
      result.pad.dependencies &&
        result.pad.dependencies.map(({ name }) => name),
    ).toEqual(['graphql', 'graphql-tools']);
    expect(result.pad.id).toBe('newid1');
    expect(result.pad.url).toBeDefined();
    expect(result.pad.token).toBeDefined();
  }
});

test('pad is updated', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const oldPad = await PadModel.getById('newid1', userContext);

  const result = await PadModel.update(
    {
      id: 'newid1',
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    userContext,
  );

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.pad).toEqual({
      ...oldPad,
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
    });
  }
});

test('pad is forked', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const result = await PadModel.fork(otherPad.id, userContext);

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.pad).toEqual({
      ...otherPad,
      id: result.pad.id,
      token: result.pad.token,
      url: result.pad.url,
      draft: null,
      context: [
        {
          key: 'secret',
          value: '',
        },
      ],
      user,
    });
    expect(result.pad.id).not.toBe(otherPad.id);
    expect(result.pad.token).not.toBe(otherPad.token);
    expect(result.pad.token).not.toBe(otherPad.url);
  }
});

test('pad draft is updated', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const input = {
    id: ownPad.id,
    code: 'draft-code',
    deployedCode: 'deployed-draft-code',
    context: [
      {
        key: 'newSecret',
        value: 'newSecret',
      },
    ],
    dependencies: ['mongodb'],
  };

  const result = await PadModel.updateDraft(input, userContext);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.pad.draft).not.toBeNull();
    expect(result.pad.draft && result.pad.draft.code).toBe('draft-code');
    expect({
      ...result.pad,
      draft: null,
    }).toEqual(ownPad);
  }
});

test('data is copied over to draft correctly', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const pad = await PadModel.getById(ownPad.id, userContext);

  expect(pad).toBeDefined();
  if (pad) {
    expect({
      ...(pad.draft || {}),
      id: ownPad.id,
      code: ownPad.code,
      deployedCode: ownPad.deployedCode,
      url: ownPad.url,
      context: ownPad.context,
      dependencies: ownPad.dependencies,
    }).toEqual(ownPad);
  }
});

test('pad draft is reset', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const result = await PadModel.deleteDraft(ownPad.id, userContext);
  expect(result.ok).toBe(true);
  if (result.ok) {
    const pad = await PadModel.getById(ownPad.id, userContext);
    expect(pad).toEqual(ownPad);
    expect(pad).toEqual(result.pad);
  }
});

test('pad metadata is updated', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const input = {
    id: ownPad.id,
    title: 'newTitle',
    description: 'newDescription',
    defaultQuery: 'newQuery',
    defaultVariables: 'newVariables',
  };

  const result = await PadModel.updatePadMetadata(input, userContext);
  expect(result.ok).toBe(true);
  if (result.ok) {
    const pad = await PadModel.getById(ownPad.id, userContext);
    expect(pad).toEqual({
      ...ownPad,
      ...input,
    });
    expect(pad).toEqual(result.pad);
  }
});

test('anon can update draft for new pad', async () => {
  const result = await PadModel.updateDraft(
    {
      id: 'newid2',
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    testContext,
  );

  expect(result.ok).toBe(true);

  const result2 = await PadModel.updateDraft(
    {
      id: ownPad.id,
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    testContext,
  );

  expect(result2.ok).toBe(false);
});

test('users can not update other users pads', async () => {
  const userContext = {
    ...testContext,
    user,
  };

  const result = await PadModel.update(
    {
      id: otherPad.id,
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    userContext,
  );

  expect(result.ok).toBe(false);

  const result2 = await PadModel.updateDraft(
    {
      id: otherPad.id,
      code: 'testCode2',
      deployedCode: 'testDeployedCode2',
      context: [
        {
          key: 'secret',
          value: 'secret',
        },
      ],
      dependencies: ['graphql-tools'],
    },
    userContext,
  );

  expect(result2.ok).toBe(false);
});
