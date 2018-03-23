import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './schema';
import { GraphQLContext } from './types';
import MongoProvider from './MongoProvider';
import WebtaskProvider from './WebtaskProvider';
import UserModel from './UserModel';

export type Options = {
  WT_TOKEN: string,
  WT_API: string,
  MONGODB_URL: string,
  AUTH0_SECRET: string,
  WT_NO_PROXY: string | null,
  WT_SINGLE_TENANT_CONTAINER: string | null,
};

export default function createServer(options: Options) {
  const app = express();

  app.options('/', cors());
  app.use(
    '/',
    cors(),
    bodyParser.json(),
    graphqlExpress(async request => {
      const user = await UserModel.verify(
        request && request.headers['authorization'] as string,
        options.AUTH0_SECRET,
      );
      return {
        schema: schema,
        context: ({
          user,
          webtaskToken: options.WT_TOKEN,
          mongo: new MongoProvider(options.MONGODB_URL),
          webtask: new WebtaskProvider({
            token: options.WT_TOKEN,
            webtaskUrl: options.WT_API,
            singleTenantContainer: options.WT_SINGLE_TENANT_CONTAINER,
            noProxy: Boolean(options.WT_NO_PROXY),
          }),
        } as GraphQLContext),
        rootValue: {},
      };
    }),
  );

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/',
    }),
  );

  return app;
}
