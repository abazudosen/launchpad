# Launchpad

Launchpad is an in-browser GraphQL server playground. You can write a GraphQL
schema example in JavaScript, and instantly create a serverless,
publicly-accessible GraphQL endpoint. We call these code snippets that live on
Launchpad “pads”.

Read the [announcement post](https://dev-blog.apollodata.com/introducing-launchpad-the-graphql-server-demo-platform-cc4e7481fcba) to understand the goals of the project.

Read the [documentation](docs.md) to learn the ins and outs of Launchpad!

## List of pads

This is a list of great pads deployed at Launchpad.

- [Hello World!](https://launchpad.graphql.com/new) - a super simple schema with one field, that just returns `"Hello, world!"`
- [Relational data: Authors and posts](https://launchpad.graphql.com/1jzxrj179) - a more complex schema that has related objects that can be fetched in a nested query.
- [Simple Mocking with graphql-tools](https://launchpad.graphql.com/98lq7vz8r) - a simple example of using the default mocking in graphql-tools to create realistic mocked data in seconds.
- [Loading from a MongoDB database](https://launchpad.graphql.com/vkmr1kl83) - an example of reading from a remote data source, in this case MongoDB.
- [MongoDB with Mongoose example](https://launchpad.graphql.com/m55w845j9) - an example of reading from a remote data source, in this case MongoDB with mongoose
- [Social Login with Auth0](https://launchpad.graphql.com/n4xk8xm87) - Authentication via JWT and social login
- [Star Wars API](https://launchpad.graphql.com/mpjk0plp9) - the Star Wars API you know and love from GraphQL.org.
- [graphql-relay-tools](https://launchpad.graphql.com/1w4r8lx49) - Relay-compliant Star Wars API created using a package that makes it easy to create a relay-compliant schema together with `graphql-tools`.
- [graphql-iso-date](https://launchpad.graphql.com/vkvpvznr3) - example code for a package that makes encoding dates in different ways easy.
- [Full-stack GraphQL + React tutorial server](https://launchpad.graphql.com/rwrz11zrn) - the result of step 2 of the excellent [Full-stack GraphQL + React tutorial](https://dev-blog.apollodata.com/full-stack-react-graphql-tutorial-582ac8d24e3b)
- [GraphQL.js code sample with mutation](https://launchpad.graphql.com/98lpqv3rr) - the basic code sample of a mutation from [this page on GraphQL.org](http://graphql.org/graphql-js/mutations-and-input-types/)
- [DataLoader](https://launchpad.graphql.com/954z0pwrr) - an example illustrating the use of DataLoader to perform batching and caching in GraphQL.
- [Movie Recommendations with Neo4j](https://launchpad.graphql.com/3wzp7qnjv) - a simple movie schema with recommendations, backed by Neo4j graph database
- [Current Weather at any location](https://launchpad.graphql.com/5rrx10z19) - Get the current weather at any location through Google Maps API geocoding and the Dark Sky weather API!
- [One To Many And One To One Relationships](https://launchpad.graphql.com/4nqqqmr19) - example showing how to implement one to many and one to one relationships the easy way
- [Singlish GraphQL](https://launchpad.graphql.com/5v3j30m39) - Search word from singlish vocabulary
- [Spotify API with Expo Snack UI](https://launchpad.graphql.com/pjwnq05l0) - how to fetch from the Spotify REST API with GraphQL, and then display it in a [React Native UI](https://snack.expo.io/ry2l_IXZW).
- [RSVP management for events](https://launchpad.graphql.com/4nq37v3x9) - Shows multiple query mutations per Mutation type, as well as querying deeply nested data.
- [GRPC](https://launchpad.graphql.com/mrwx0l4x9) - Example using [GRPC](http://www.grpc.io/)
- [Fetching artists and events from Ticketmaster API](https://launchpad.graphql.com/9pw9nnkjr) - Fetch information about artists and events from the [Ticketmaster REST API](http://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/). Follow along with a workshop [here](https://github.com/stubailo/ticketmaster-workshop).
- [Returning Query type from fields and mutations](https://launchpad.graphql.com/9w8v1jvkr) - [Read the writeup here.](https://medium.com/@stubailo/returning-the-query-type-in-graphql-111d5c0b15b8)

Something is missing?
[Create an issue!](https://github.com/apollographql/launchpad/issues/new)

Help Launchpad by creating more pads! Examples of the pads are available
[in issues under corresponding label](https://github.com/apollographql/launchpad/issues?q=is%3Aopen+is%3Aissue+label%3A%22launchpad+example%22)

[![Launchpad screenshot](screenshot.png)](https://launchpad.graphql.com/1jzxrj179)

## Architecture

For an overview of how Apollo Launchpad is built, check out the [post detailing the original effort](https://dev-blog.apollodata.com/introducing-launchpad-the-graphql-server-demo-platform-cc4e7481fcba). This is a visualization of that effort:

![Launchpad Architecture](./docs/img/architecture.png)

## Development

### Running the frontend code

There are two ways to run Launchpad - against the staging server or against
your own server. Running against staging server is simpler, but naturally
you can't control the server. Note that running against staging server is
only possible on localhost and is meant for development purposes.

Both server and the client locally use `.env` file to set up settings. You
just need one `.env` file in the root of the project with all of the variables
which are read by the client and/or server.

For running against staging server, the config should be like following (you
can also copy `.env.staging.template` to your `.env`):

```
REACT_APP_LAUNCHPAD_API_URL=https://launchpad-api-staged.herokuapp.com/
REACT_APP_AUTH0_DOMAIN=meteor.auth0.com
REACT_APP_AUTH0_CLIENT_ID=kUtxJjyapGN72Rs7tt5jXMgQ7axDgJLa
```

Then the client can be run locally:

```
npm install # npm 5 recommended
npm start
```

To test:

```
npm install
npm test
```

Limitation - currently logs are not accessible on staging (or by running single
tenant server yourself).

### Using a local server

Running the server is more complicated. You need [MongoDB](https://docs.mongodb.com/manual/administration/install-community/), [Auth0 account](https://auth0.com/signup) and
[Auth0 Extend account](https://auth0.com/extend) (currently it requires enterprise account). Once you get
those, you can set the server and client up with the following `.env` file.

```
REACT_APP_LAUNCHPAD_API_URL=http://localhost:8000
REACT_APP_AUTH0_DOMAIN={YOUR AUTH0 DOMAIN}
REACT_APP_AUTH0_CLIENT_ID={YOUR AUTH0 CLIENTID}
WT_TOKEN={YOUR MASTER AUTH0 EXTEND TOKEN}
WT_API={YOUR AUTH0 EXTEND OR OTHER WEBTASK PROVIDER API URL}
WT_SINGLE_TENANT_CONTAINER={Container name if running single tenant webtask/extend}
WT_NO_PROXY=true
MONGODB_URL={YOUR MONGODB URL}
AUTH0_SECRET={YOUR AUTH0 SECRET}
```

To obtain an Auth0 client id, you must create an application. Inside of that application, found under [Auth0 clients](https://manage.auth0.com/#/clients), make sure that you have added http://localhost:3000 to your Allowed Origins(CORS), shown below. This ensures that your browser will accept the response from Auth0's servers that indicates a user is logged in.

![Adding CORS](./docs/img/cors.png)

Then you can run server

```
npm install
npm run dev-server
```

To test your server implementation, ensure that you have a mongodb instance running at MONGO_URL and then run:

```
npm run test-server
```

To log the information produced by a backing webtask in testing, create a profile, then run the log command.

```
npm install wt-cli -g
wt init -p "lp-test" \
     --url https://wt-launchpad.it.auth0.com \
     --token $WT_TOKEN \
     --container launchpad-test
wt logs -p "lp-test"
```

### Using the staging webtask

Running against staging webtask service, so you don't need your own webtask or Auth0 Extend account.

```
REACT_APP_LAUNCHPAD_API_URL=http://localhost:8000
REACT_APP_AUTH0_DOMAIN={YOUR AUTH0 DOMAIN}
REACT_APP_AUTH0_CLIENT_ID={YOUR AUTH0 CLIENTID}
MONGODB_URL={YOUR MONGODB URL}
AUTH0_SECRET={YOUR AUTH0 SECRET}
WT_SINGLE_TENANT_CONTAINER=launchpad-staging
WT_NO_PROXY=true
WT_TOKEN=eyJhbGciOiJIUzI1NiIsImtpZCI6ImxhdW5jaHBhZC0xIn0.eyJqdGkiOiJiOGQ4OWE2OWUxN2Y0NWNhODIxM2M4ZGVjZDVlYjY4MyIsImlhdCI6MTQ5NzYwMjk0NiwiY2EiOlsiZmYxNDczNDYzNzY5NDNmMWEwN2JkMmQyNDkyYmUzZTkiXSwiZGQiOjIsInRlbiI6ImxhdW5jaHBhZC1zdGFnaW5nIn0.jT31-pdmCG8QyrZnwMYO5Mgi6GUe5D9tfTFT8X1XiBw
WT_API=https://wt-launchpad.it.auth0.com/api
```

Then you can run server

```
npm install
npm run dev-server
```

### Production

Building frontend production bundle:

```
npm run build
```

Build backend.

```
npm run build-server
```

Run compiled backend

```
npm run start-server
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
