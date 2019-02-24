const { GraphQLInt, GraphQLNonNull, GraphQLString } = require('graphql');

const {
  connectionArgs: connectionArgsBase,
  connectionDefinitions: connectionDefinitionsBase,
  connectionFromArraySlice,
} = require('graphql-relay');

const connectionArgs = {
  order: {
    type: GraphQLString,
  },
  sort: {
    type: GraphQLString,
  },
  ...connectionArgsBase,
};

function connectionDefinitions(config) {
  // eslint-disable-next-line
  config.connectionFields = {
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  };
  return connectionDefinitionsBase(config);
}

// TODO flesh this out
function connectionFromDynamoDB(
  response,
  args,
) {
  const offset = 0;
  const count = response.Count;

  const values = connectionFromArraySlice(
    response.Items,
    args,
    {
      sliceStart: offset,
      arrayLength: count,
    },
  );

  return {
    ...values,
    totalCount: count,
  };
}

module.exports = {
  connectionArgs,
  connectionDefinitions,
  connectionFromDynamoDB,
};
