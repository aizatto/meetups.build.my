module.exports = (serverless) => {
  const params = {
    EVENTS_TABLE: 'events',
    EVENTS_STATUS_INDEX: 'status',
    EVENTS_START_TIME_INDEX: 'start_time',
    EVENTS_END_TIME_INDEX: 'end_time',
    ORGANIZATIONS_TABLE: 'organizations',
    ORGANIZATIONS_SOURCE_INDEX: 'source',
  };

  if (serverless.pluginManager.cliCommands[0] !== 'deploy') {
    return params;
  }

  const stage = serverless.pluginManager.cliOptions['stage'];

  // need to test if I don't use the provider stage
  const PREFIX = `build-my-${stage}`;

  const deployed_params = {};
  for (const key in params) {
    const value = params[key];

    if (key.slice("_TABLE".length * -1) === "_TABLE") {
      deployed_params[key] = `${PREFIX}-${value}`
    } else {
      deployed_params[key] = value;
    }
  }

  return deployed_params;
}
