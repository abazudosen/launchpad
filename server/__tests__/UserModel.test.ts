/* @flow */

import jwt from 'jsonwebtoken';
import type { Pad, GraphQLContext } from '../types';

import UserModel from '../UserModel';

import { createTestContext } from '../../test/testUtils';

const context = ((createTestContext(null): any): GraphQLContext);

describe('verify', () => {
  const secret =
    'mKVFmMkznAG2L5HXgizAaqCP5HrTtYePwbDDYIhkNJAeYwWHcmH8Wt93S1lwYYQ';
  const secret2 =
    'XyCg253ILEcmU4WsInmRvhqsEqEBsvuHdEF1TkIWUZxN5mztiaX6z94nWNpSjsW';

  test('no authorization', async () => {
    expect(await UserModel.verify(null, secret)).toBeNull();
  });

  test('valid authorization', async () => {
    const authorization = `Bearer: ${jwt.sign(
      {
        sub: 'test-id',
        nickname: 'test-username',
        iat: Math.floor(Date.now() / 1000),
      },
      secret,
      {
        expiresIn: '1 min',
      },
    )}`;
    expect(await UserModel.verify(authorization, secret)).toEqual({
      id: 'test-id',
      githubUsername: 'test-username',
    });
  });

  test('invalid authorization', async () => {
    const authorization = `Bearer: ${jwt.sign(
      {
        sub: 'test-id',
        nickname: 'test-username',
      },
      secret2,
    )}`;
    expect(await UserModel.verify(authorization, secret)).toBeNull();
  });

  test('expired authorization', async () => {
    const authorization = `Bearer: ${jwt.sign(
      {
        sub: 'test-id',
        nickname: 'test-username',
        iat: Math.floor(Date.now() / 1000) - 3000,
      },
      secret,
      {
        expiresIn: '1 min',
      },
    )}`;
    expect(await UserModel.verify(authorization, secret)).toBeNull();
  });
});

describe('me', () => {
  test('anonymous', () => {
    expect(UserModel.me(context)).toBeNull();
  });

  test('logged-in', () => {
    const user = {
      id: 'test-id',
      githubUsername: 'testUsername',
    };
    expect(
      UserModel.me({
        ...context,
        user,
      }),
    ).toEqual(user);
  });
});

describe('permissions', () => {
  const anon = null;
  const user1 = {
    id: 'test-id1',
    githubUsername: 'testUsername1',
  };
  const user2 = {
    id: 'test-id2',
    githubUsername: 'testUsername2',
  };

  const padNull = (({
    id: 'pad-1',
    user: null,
  }: any): Pad);

  const padUser1 = (({
    id: 'pad-2',
    user: user1,
  }: any): Pad);

  const padUser2 = (({
    id: 'pad-3',
    user: user2,
  }: any): Pad);

  describe('can see pad secrets', () => {
    test('only owner can see pad secrets', () => {
      expect(UserModel.canSeePadSecrets(anon, padUser1, context)).toBe(false);
      expect(UserModel.canSeePadSecrets(user1, padUser1, context)).toBe(true);
      expect(UserModel.canSeePadSecrets(user2, padUser1, context)).toBe(false);
      expect(UserModel.canSeePadSecrets(anon, padUser2, context)).toBe(false);
      expect(UserModel.canSeePadSecrets(user1, padUser2, context)).toBe(false);
      expect(UserModel.canSeePadSecrets(user2, padUser2, context)).toBe(true);
    });

    test('anonymous pad secrets can be seen by anyone', () => {
      [anon, user1, user2].forEach(user => {
        expect(UserModel.canSeePadSecrets(user, padNull, context)).toBe(true);
      });
    });
  });

  describe('can update pad', () => {
    test('only owner can update pad', () => {
      expect(UserModel.canUpdatePad(anon, padUser1, context)).toBe(false);
      expect(UserModel.canUpdatePad(user1, padUser1, context)).toBe(true);
      expect(UserModel.canUpdatePad(user2, padUser1, context)).toBe(false);
      expect(UserModel.canUpdatePad(anon, padUser2, context)).toBe(false);
      expect(UserModel.canUpdatePad(user1, padUser2, context)).toBe(false);
      expect(UserModel.canUpdatePad(user2, padUser2, context)).toBe(true);
    });

    test('non-anonymous user can update anonymous pad', () => {
      expect(UserModel.canUpdatePad(anon, padNull, context)).toBe(false);
      expect(UserModel.canUpdatePad(user1, padNull, context)).toBe(true);
      expect(UserModel.canUpdatePad(user2, padNull, context)).toBe(true);
    });
  });

  describe('can update draft', () => {
    test('owner can update draft', () => {
      expect(UserModel.canUpdateDraft(anon, padUser1, context)).toBe(false);
      expect(UserModel.canUpdateDraft(user1, padUser1, context)).toBe(true);
      expect(UserModel.canUpdateDraft(user2, padUser1, context)).toBe(false);
      expect(UserModel.canUpdateDraft(anon, padUser2, context)).toBe(false);
      expect(UserModel.canUpdateDraft(user1, padUser2, context)).toBe(false);
      expect(UserModel.canUpdateDraft(user2, padUser2, context)).toBe(true);
    });

    test('anonymous pad draft can be updated by anyone', () => {
      [anon, user1, user2].forEach(user => {
        expect(UserModel.canUpdateDraft(user, padNull, context)).toBe(true);
      });
    });
  });
});
