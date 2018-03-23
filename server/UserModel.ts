import { verify } from 'jsonwebtoken';
import { User, Pad, GraphQLContext } from './types';

interface VerifyResult {
  ok: true;
  result: Record<string, string>;
};

interface VerifyFailure {
  ok: false;
  result: Error;
};

type VerificationPromise = VerifyResult | VerifyFailure;

const UserModel = {
  filter(user: User | null, context: GraphQLContext) {
    if (user) {
      return {
        id: user.id,
        githubUsername: user.githubUsername,
      };
    } else {
      return null;
    }
  },


  async verify(authorization: string | undefined, secret: string): Promise<User | null> {
    const bearerLength = 'Bearer: '.length;
    if (authorization && authorization.length > bearerLength) {
      const token = authorization.slice(bearerLength);
      const result = await new Promise<VerificationPromise>(resolve =>
        verify(token, secret, (err, result) => {
          if (err) {
            resolve({
              ok: false,
              result: err,
            });
          } else {
            resolve({
              ok: true,
              result: result as Record<string, string>,
            });
          }
        }),
      );
      if (result.ok) {
        return {
          id: result.result.sub,
          githubUsername: result.result.nickname,
        };
      } else {
        console.error(result.result);
        return null;
      }
    } else {
      return null;
    }
  },

  me(context: GraphQLContext): User | null {
    if (context.user) {
      return UserModel.filter(context.user, context);
    } else {
      return null;
    }
  },

  canSeePadSecrets(user: User | null, pad: Pad | null, context: GraphQLContext): boolean {
    return Boolean(!pad || !pad.user || (user && user.id === pad.user.id));
  },

  canUpdatePad(user: User | null, pad: Pad | null, context: GraphQLContext): boolean {
    return Boolean(user && (!pad || !pad.user || user.id === pad.user.id));
  },

  canUpdateDraft(user: User | null, pad: Pad | null, context: GraphQLContext): boolean {
    return Boolean(!pad || !pad.user || (user && user.id === pad.user.id));
  },
};

export default UserModel;
