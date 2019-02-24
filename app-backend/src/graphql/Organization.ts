const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const {
  globalIdField,
} = require('graphql-relay');

const { connectionDefinitions } = require('./utils.ts');

// TODO I can't reassign a variable to `queryPromise` in typescript
// from https://stackoverflow.com/questions/50391825/cant-insert-data-into-dynamodb-using-new-nodejs-8-10
//
import { promisify } from 'util';
const { client: dynamodb } = require('./../dynamodb');
dynamodb.scanPromise = promisify(dynamodb.scan);

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  fields: {
    id:  globalIdField('Organization'),
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    link: {
      type: GraphQLNonNull(GraphQLString),
    }
  }
});

export const {
  connectionType: OrganizationConnection,
  edgeType: OrganizationEdge,
} = connectionDefinitions({
  name: 'Organization',
  nodeType: Organization,
});

export async function OrganizationsResolver() {
  const orgs = await dynamodb.scanPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    FilteredExpression: "source = :source",
    ExpressionAttributeValues: {
      ':source': 'meetup',
    },
    Limit: 1,
  });

  return orgs;
}
