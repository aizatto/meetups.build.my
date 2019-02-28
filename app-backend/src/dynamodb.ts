const { DynamoDB } = require('aws-sdk');
import { promisify } from 'util';

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

// TODO I can't reassign a variable to `queryPromise` in typescript
// from https://stackoverflow.com/questions/50391825/cant-insert-data-into-dynamodb-using-new-nodejs-8-10
client.queryPromise = promisify(client.query);
client.scanPromise = promisify(client.scan);
