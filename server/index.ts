/* @flow */

import createServer from './createServer';
import type { Options } from './createServer';

function getFromEnv(key): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: '${key}'`);
  }
  return value || null;
}

function getFromEnvNullable(key): ?string {
  const value = process.env[key];
  return value || null;
}

const options: Options = {
  WT_TOKEN: getFromEnv('WT_TOKEN'),
  WT_API: getFromEnv('WT_API'),
  MONGODB_URL: getFromEnv('MONGODB_URL'),
  AUTH0_SECRET: getFromEnv('AUTH0_SECRET'),
  WT_NO_PROXY: getFromEnvNullable('WT_NO_PROXY'),
  WT_SINGLE_TENANT_CONTAINER: getFromEnvNullable('WT_SINGLE_TENANT_CONTAINER'),
};

const app = createServer(options);

app.listen(process.env.PORT || 8000, function() {
  console.log('Server started!');
});
