# Facebook Scraping

Facebook Scraping is difficult because Facebook has disabled scraping another Group or Pages event, unless you request for permission.

Options:
1. Have Facebook email you the Event Details
  - Pros:
    - I have a working implementation
    - Doesn't require Facebook Access Token
  - Cons:
    - You have mark yourself as "Interested" to an Event
      - Everyone on your Facebook can see this
    - You have to remember to use the email you specified
2. Use Facebook's "Add to Page..." Feature, and only scrape a Page you own
  - Pros:
    - Can reuse Facebook APIs
  - Cons:
    - You have to create/maintain a new page
    - Requires polling

I originally went with Option 1, but exploring Option 2 as I dislike having to expose myself as "Interested" to an Event, when I'm not really.

# Meetup Craping

- https://www.meetup.com/meetup_api/docs/:urlname/#list
- https://www.meetup.com/meetup_api/docs/:urlname/events/#list

# Test Locally

```sh
SLS_DEBUG=* sls invoke local --function meetupAllOrganizations --stage dev --region ap-southeast-1
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
