const {
  GraphQLSchema,
  GraphQLObjectType,
} = require('graphql');

const {
  connectionArgs,
} = require('graphql-relay');

const { EventConnection, EventsResolver } = require('./Event.ts');
const { OrganizationConnection, OrganizationsResolver } = require('./Organization.ts');

const fields = {
  events: {
    args: {
      ...connectionArgs,
    },
    type: EventConnection,
    resolve: EventsResolver,
  },
  organizations: {
    args: {
      ...connectionArgs,
    },
    type: OrganizationConnection,
    resolve: OrganizationsResolver,
  },
};

const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  fields,
});


export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...fields,
      viewer: {
        type: Viewer,
        resolve: (_, args) => args,
      }
    }
  }),
});
