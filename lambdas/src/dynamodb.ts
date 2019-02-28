'use strict';

import { DynamoDB } from 'aws-sdk'

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
