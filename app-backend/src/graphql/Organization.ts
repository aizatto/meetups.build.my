const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const {
  globalIdField,
} = require('graphql-relay');

const {
  connectionDefinitions,
  connectionFromDynamoDB,
} = require('./utils.ts');

const { client: dynamodb } = require('./../dynamodb');

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  fields: {
    id:  globalIdField('Organization'),
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    link: {
      type: GraphQLString,
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

export async function OrganizationsResolver(_, args) {
  const response = await dynamodb.scanPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
  });

  return connectionFromDynamoDB(response, args);
}
