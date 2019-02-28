import express from "express";
import serverless from "serverless-http";
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser')
import { Schema } from './graphql/Schema.ts';

const app = express();

app.use(bodyParser.json());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: Schema,
    graphiql: true,
    pretty: true,
    formatError: error => {
      // eslint-disable-next-line no-console
      console.error(error);
      return error;
    },
  }),
);

const expressHandler = serverless(app);

export { expressHandler };
