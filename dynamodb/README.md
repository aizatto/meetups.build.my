

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
