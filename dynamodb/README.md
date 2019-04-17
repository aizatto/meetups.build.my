

# Source Repository

See https://github.com/aizatto/serverless-prototypes/tree/master/dynamic-table-names

Changes:

- Hard coded the stage name

# Migration Plan

- Backup Production DB
- Test deploying this serverless.yml
- Remove dynamo config from app-backed/serverless.yml
- Test deploying app-backed/serverless.yml

# Notes

- https://serverless.com/framework/docs/providers/aws/guide/variables/#reference-cloudformation-outputs

# To Recreate

```sh
serverless create --template aws-nodejs --path aws-dynamodb
```

```sh
yarn add --dev serverless-dynamodb-local@0.2.30
```

- Create `table.js`
- Update `serverless.yml`
  - Rename `service`
