# Test Locally

```sh
SLS_DEBUG=* sls invoke local --function meetupAllOrganizations --stage dev --region ap-southeast-1
SLS_DEBUG=* sls invoke local --function facebookEvent --data '{"body":"{\"id\":\"2202484380027712\",\"region\":\"kl\"}"}' --stage dev --region ap-southeast-1
```

# Update Schema

```sh
ts-node src/scripts/updateSchema.ts
```

# Deploy

```sh
SLS_DEBUG=* sls deploy --stage dev --region ap-southeast-1
```

# Production

https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html

```sh
aws lambda invoke --function-name build-my-backend-prod-meetupAllOrganizations /dev/stdout
aws lambda invoke --function-name build-my-backend-dev-facebookEvent --payload '{"body":"{\"id\":\"2202484380027712\",\"region\":\"kl\"}"}' /dev/stdout
```
