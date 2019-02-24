const fs = require('fs');
const {printSchema} = require('graphql/utilities');
const path = require('path');

const schemaPath = path.join(__dirname, '../../data/schema');

const { Schema } = require('./../graphql/Schema.ts');

fs.writeFileSync(
  `${schemaPath}.graphql`,
  printSchema(Schema, {commentDescriptions: true}),
);
process.exit(0);
