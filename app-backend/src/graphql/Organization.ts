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
    },
    last_event_at: {
      type: GraphQLString,
    },
    last_event_url: {
      type: GraphQLString,
    },
    next_event_at: {
      type: GraphQLString,
    },
    next_event_url: {
      type: GraphQLString,
    },
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
  console.log({
    TableName: process.env.ORGANIZATIONS_TABLE,
    IndexName: process.env.ORGANIZATIONS_STATUS_INDEX,
    KeyConditionExpression: "#s = :status",
    ExpressionAttributeNames:{
        "#s": "status",
    },
    ExpressionAttributeValues: {
        ":status": "active"
    },
  });
  const response = await dynamodb.queryPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    IndexName: process.env.ORGANIZATIONS_STATUS_INDEX,
    KeyConditionExpression: "#s = :status",
    ExpressionAttributeNames:{
        "#s": "status",
    },
    ExpressionAttributeValues: {
        ":status": "active"
    },
  });

  return connectionFromDynamoDB(response, args);
}
