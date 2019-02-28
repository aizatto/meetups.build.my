const {
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const {
  globalIdField,
} = require('graphql-relay');

const {
  connectionArgs,
  connectionDefinitions,
  connectionFromDynamoDB,
} = require('./utils.ts');

const { client: dynamodb } = require('./../dynamodb');

export const Event = new GraphQLObjectType({
  name: 'Event',
  fields: () => {
    return {
      id: globalIdField('Event'),

      name: {
        type: new GraphQLNonNull(GraphQLString),
      },

      description: {
        type: GraphQLString,
      },

      start_time: {
        type: new GraphQLNonNull(GraphQLString),
      },

      end_time: {
        type: new GraphQLNonNull(GraphQLString),
      },

      venue: {
        type: GraphQLString,
      },

      place: {
        type: GraphQLString,
      },

      city: {
        type: GraphQLString,
      },

      country: {
        type: GraphQLString,
      },

      link: {
        type: GraphQLString,
      },
    };
  },
  interfaces: () => {
  },
});

export const {
  connectionType: EventConnection,
  edgeType: EventEdge,
} = connectionDefinitions({
  name: 'Event',
  nodeType: Event,
});

export const EventConnectionInterfaceArgs = {
  afterStartTime: {
    type: GraphQLInt,
    description: 'unixtime',
  },
  ...connectionArgs,
};

export const EventConnectionInterface = new GraphQLInterfaceType({
  name: 'EventConnectionInterface',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    events: {
      type: EventConnection,
      args: EventConnectionInterfaceArgs,
    },
  },
  resolveType: () => {},
});

export async function EventsResolver(_, args) {
  const response = await dynamodb.queryPromise({
    TableName: process.env.EVENTS_TABLE,
    IndexName: process.env.EVENTS_START_TIME_INDEX,
    KeyConditionExpression: "#s = :status",
    ExpressionAttributeNames:{
        "#s": "status",
    },
    ExpressionAttributeValues: {
        ":status": "upcoming"
    },
  });

  return connectionFromDynamoDB(response, args);
}
