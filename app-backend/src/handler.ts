import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda';
import {
  fetchAll as fetchAllFacebookOrganizations,
  createOrUpdateOrganization as createOrUpdateFacebookOrganization,
  createOrUpdateEvent as createOrUpdateFacebookEvent,
} from './facebook.ts';
import {
  fetchAll as fetchAllMeetupOrganizations,
  createOrUpdateOrganization as createOrUpdateMeetupOrganization,
} from './meetup.ts';
import express from "express";
import serverless from "serverless-http";
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser')
import { Schema } from './graphql/Schema.ts';

export const facebookAllOrganizations: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const results = await fetchAllFacebookOrganizations();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const facebookOrganization: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const data = JSON.parse(event.body);
  const results = await createOrUpdateFacebookOrganization(data.id, data.region);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const facebookEvent: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const data = JSON.parse(event.body);
  const results = await createOrUpdateFacebookEvent(data.id, data.region);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const meetupAllOrganizations: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const results = await fetchAllMeetupOrganizations();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const meetupOrganization: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const data = JSON.parse(event.body);
  const results = await createOrUpdateMeetupOrganization(data.id, data.region);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  };
}

// This mess is because we want to use `graphqlHTTP` to display graphiql
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
