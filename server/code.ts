export const STARTER_CODE = `// Welcome to Launchpad!
// Log in to edit and save pads, run queries in GraphiQL on the right.
// Click "Download" above to get a zip with a standalone Node.js server.
// See docs and examples at https://github.com/apollographql/awesome-launchpad

// graphql-tools combines a schema string with resolvers.
import { makeExecutableSchema } from 'graphql-tools';

// Construct a schema, using GraphQL schema language
const typeDefs = \`
  type Query {
    hello: String
  }
\`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return 'Hello world!';
    },
  },
};

// Required: Export the GraphQL.js schema object as "schema"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Optional: Export a function to get context from the request. It accepts two
// parameters - headers (lowercased http headers) and secrets (secrets defined
// in secrets section). It must return an object (or a promise resolving to it).
export function context(headers, secrets) {
  return {
    headers,
    secrets,
  };
};

// Optional: Export a root value to be passed during execution
// export const rootValue = {};

// Optional: Export a root function, that returns root to be passed
// during execution, accepting headers and secrets. It can return a
// promise. rootFunction takes precedence over rootValue.
// export function rootFunction(headers, secrets) {
//   return {
//     headers,
//     secrets,
//   };
// };
`;

export const RUNNER_WRAPPER = (code: string) =>
  `
  var __LAUNCHPAD__runtimeError;
  try {
    ${code};
  } catch (e) {
    __LAUNCHPAD__runtimeError = e;
  }

  (function() {
    if (__LAUNCHPAD__runtimeError) {
      module.exports = function (context, callback) {
        callback(__LAUNCHPAD__runtimeError);
      };
      return;
    }

    var graphql = require('graphql');
    var ApolloEngine = require('apollo-engine').ApolloEngine;
    var express = require('express');
    var Webtask = require('webtask-tools');
    var bodyParser = require('body-parser');
    var graphqlExpress = require('launchpad-module').apolloServerExpress.graphqlExpress;

    var request = require('request');


    var schemaFunction =
      exports.schemaFunction ||
      function() {
        return exports.schema;
      };
    var schema;
    var rootValue = exports.rootValue || {};
    var rootFunction =
      exports.rootFunction ||
      function() {
        return rootValue;
      };
    var contextFn =
      exports.context ||
      function(headers, secrets) {
        return Object.assign(
          {
            headers: headers,
          },
          secrets
        );
      };

    Object.keys(exports).forEach(function(key) {
      if (
        [
          'default',
          'schema',
          'schemaFunction',
          'context',
          'rootValue',
          'rootFunction',
        ].indexOf(key) === -1
      ) {
        throw new Error('Unknown export: ' + key);
      }
    });

    if (!exports.schema && !exports.schemaFunction) {
      throw new Error(
        'You need to export object with a field \`schema\` or a function \`schemaFunction\` to run a Pad.'
      );
    }

    process.env["GOMAXPROCS"] = "1"

    if (!global.__server) {
      global.__server = express();
      global.__server.use(
        '/',
        (req, res, next) => {
          req.userContext = req.headers['usercontext']
          if (!schema) {
            schema = schemaFunction(req.userContext);
          }
          next();
        },
        bodyParser.json(),
        (req, res, next) => {
          graphqlExpress({
            schema: schema,
            tracing: true,
            cacheControl: true,
          })(req, res, next)
        }
      );
    }

    if(!global.__proxyExpress) {
      global.__proxyExpress = express();
    }

    if(!global.__webtask) {
      global.__webtask = Webtask.fromExpress(global.__server);
    }

    module.exports = function (context, req, res) {
      req.userContext = JSON.parse(
        context.secrets.userContext
      ).reduce(function(acc, next) {
        acc[next.key] = next.value;
        return acc;
      }, {});

      if (req.userContext.APOLLO_ENGINE_KEY) {
        if(!global.__engine) {
          global.__engine = new ApolloEngine({
            apiKey: req.userContext.APOLLO_ENGINE_KEY,
          });

          global.__engine.listen({
            graphqlPaths: ['/'],
            expressApp: global.__server,
            port: 0,
            innerHost: '127.0.0.1'
          }, () => {
            global.__proxyExpress.use((req, res, next) => {
              req.pipe(process.stdout);

              var proxyRes = req.pipe(request({
                uri: global.__engine.engineListeningAddress.url,
                forever: true,
                headers: {
                  'usercontext': JSON.stringify(req.userContext),
                  'host': req.headers['host'],
                },
              }))
                .on('error', (err) => {
                  console.error(err);
                  res.writeHead(503);
                  res.end();
                });

              proxyRes.pipe(process.stdout);
              proxyRes.pipe(res);
            });

            global.__webtask = Webtask.fromExpress(global.__proxyExpress);
            global.__webtask(context, req, res);
          });
        } else {
          global.__webtask(context, req, res);
        }
      } else {
        global.__webtask(context, req, res);
      }
    }
  })();
`;
