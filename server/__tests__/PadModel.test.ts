import PadModel from '../PadModel';
import { Pad, User, GraphQLContext } from '../types';
import {
  createTestContext,
  createTestDatabaseName,
} from './utils/testUtils';

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

describe('PadModel', () => {
  let testContext: GraphQLContext;
  let mongoUrl;

  beforeAll(async () => {
    let baseMongoUrl =
      process.env.TEST_MONGODB_URL || 'mongodb://127.0.0.1:27017';
    mongoUrl = `${baseMongoUrl}/${createTestDatabaseName()}`;
    testContext = ((createTestContext(mongoUrl) as any) as GraphQLContext);
    await (await testContext.mongo.mongodb)
      .collection('Pads')
      .insertMany([{ ...ownPad }, { ...otherPad }]);
  });

  afterAll(async () => {
    if (testContext.mongo) {
      await (await testContext.mongo.mongodb).dropDatabase();
    }
  });

  it('filters sensitive data', () => {
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

  it('can create an empty pad', () => {
    expect(PadModel.empty(testContext)).toMatchSnapshot();
  });

  it('retrives a pad', async () => {
    const userContext = {
      ...testContext,
      user,
    };

    const pad = await PadModel.getById('fakeid1', userContext);
    expect(pad).toEqual(ownPad);
  });

  it('retrieves owned pads', async () => {
    const userContext = {
      ...testContext,
      user,
    };

    const pads = await PadModel.listMyPads(userContext);
    expect(pads).toEqual([ownPad]);
  });

  it('can create a pad without an id', async () => {
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

  it('can create aa pad with an id', async () => {
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

  it('can update a pad', async () => {
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

  it('can fork a pad', async () => {
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

  it('can update a draft pad', async () => {
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

  it('copies data over to draft correctly', async () => {
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

  it('can reset a pad draft', async () => {
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

  it('can update pad metadata', async () => {
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

  it('can update draft for new pad with an anonymous user', async () => {
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

  it('does not allow users to update other users pads', async () => {
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

})
