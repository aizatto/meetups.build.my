import { promisify } from 'util';
const { DynamoDB } = require('aws-sdk');

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE ||
    process.env.IS_LOCAL) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

export const client = new DynamoDB.DocumentClient(options);
client.putPromise = promisify(client.put);
client.queryPromise = promisify(client.query);
client.updatePromise = promisify(client.update);
