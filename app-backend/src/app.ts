import * as express from "express";
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser')
import { Schema } from './graphql/Schema';

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

export { app };
