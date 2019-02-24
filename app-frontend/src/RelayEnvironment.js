const {Environment, Network, RecordSource, Store} = require('relay-runtime');

function fetchQuery(operation, variables) {
  // eslint-disable-next-line no-undef
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
    credentials: 'same-origin',
  })
    .then(response => response.json())
    .then(json => {
      // TODO: we shouldn't be handling it like this, but because of
      // a bug in how Relay handles errors in mutations we need
      // to throw the errors.
      //
      // This is good and bad.
      // The good is that we don't silently swallow the errors.
      // The bad is that we are supposed to according to the GraphQL spec.
      //
      // https://github.com/facebook/relay/issues/1816
      if (operation.query &&
          operation.query.operation === 'mutation' &&
          json.errors) {
        return Promise.reject(json.errors);
      }

      return Promise.resolve(json);
    });
}

export const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
