# Goals

- Build a low cost community event aggregator
- Experiment with Technologies
  - AWS DynamoDB
  - AWS CloudWatch Events
    - Using this as a cron job
  - Serverless
  - Facebook's GraphQL
    - Not Apollo
  - Relay
  - React
  - TypeScript
  - Auth0
- Region support
    - A great example is https://engineers.sg but they only support Singapore
    - I travel with South East Asia

Local (Malaysian) alternatives:

- http://devkami.com/meetups/
- http://malaysia.herokuapp.com/
- https://docs.google.com/spreadsheets/d/16ncyDZH-wGN1XK9D0En2teWNw5WLnf-jrrfvzRaajgs/edit#gid=0

Event Goals:

- Local tech community discovery
- This is not a page to sell a person/company's product
- Help people new to the industry to find relevant events
- Spur and encourage building more things
- Have a community of builders

Current Rules for including Events:

- Most Events in Malaysia
  - Definitely community events
  - Definitely conferences
  - Definitely Hackathons
  - Maybe paid workshops
  - Maybe networking events
- Conferences in the region (Malaysia)
- Limit events from Singapore
  - Already has https://engineers.sg
  - Definitely include conferences to expose people to a larger community

How I define:

- Community:
  - Grass roots
  - Intentions are not for profit
  - Can charge money to pay for expenses (venue, speakers, etc)
  - Can charge a minimal amount to get people to confirm their spots
  - Should include most Student targeted events
- Workshops:
  - These can be both both commercial and community, so can be confusing
- Hackathons:
  - These can be both both commercial and community, so can be confusing
- Conferences:
  - These can be both both commercial and community, so can be confusing

When does a Meetup become Inactive?

- Cannot be scraped
- No upcoming events
- No events in the past 6 months

## Warnings, Disclaimer, Gotchas

- This isn't the cleanest of codes I've written
- I am new to all this serverless infrastructure. Keeping notes at:
  - https://www.aizatto.com/notes/serverless/
  - https://www.aizatto.com/notes/aws/
  - https://www.aizatto.com/notes/aws/dynamodb/
- I use some of my own GraphQL utils
  - https://github.com/aizatto/nodejs/blob/master/src/graphql/fn.js
- Most likely not the best DynamoDB designed tables

## TODO / Features / Bugs

- Fix naming of variables
- Disable Organizations which are constantly failing
  - Meetup could have been deleted
- Fix TypeScript's inability to update DynamoDB DocumentClient definition
- Properly TypeScript this
- Add eslint/prettier support
- Fix Facebook Scraper
  - Can't scrape a Group or Page's events because of permissions
- Create Custom Events
  - Eventbrite
  - Peatix
- Social Media tags, and links
- SEO
- Optimize tables
  - Use proper indexes
  - Projections
- Facebook errors don't show up in Lambda
- Notifications for out of memory errors
- When working locally, strip prefix on table names
- Front End
  - Display Meetup Name
  - Display previous events
  - Display upcoming calendar
  - List of meetups
  - Possibly Taxonomy
  - Have ability to filter by date and region
  - Google Form to submit
- Need a lambda to convert "upcoming" events to "past"
- Stop fetching all meetup events
- Split up `app-backend/serverless.yml` into multiple services:
  - lambdas
  - dynamodb

## Questions

- How thin should this app/repository be?
  - As a prototype/toy/experiment its great to be self contained
  - https://github.com/serverless/serverless-graphql
    - Splits in 2
- Can GraphQL and Relay play friendly with typescript?
- When should I use [AWS Step Functions](https://aws.amazon.com/step-functions/)?
- Should I organize this into lerna?
- Naming
  - How should I name indexes and tables?
- What events should be aggregated, and what shouldn't?

# Deploy

Need to manually configure API Gateway to proxy root path ("/") to S3 bucket
https://github.com/serverless/serverless/issues/1738

# Developer Notes

Front end was created via `create-react-app`

- https://serverless.com/framework/docs/providers/aws/events/schedule/
- https://www.jamestharpe.com/serverless-typescript-getting-started/

## Heroku

I originally started with Heroku, but found some limitations (yes I'm cheap). I also wanted to experiment with technologies that I'm most likely going to use (Serverless)

Regions:
- [Heroku](https://devcenter.heroku.com/articles/regions): US & Europe

Data Store:
- [Heroku PostgreSQL](https://elements.heroku.com/addons/heroku-postgresql) (Hobby Dev):
  - Row Limit 10,000
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/pricing/on-demand/) (Asia Pacific (Singapore)):
  - Write request units: $1.4231 per million write request units
  - Read request units: $0.2846 per million read request units
  - First 25 GB stored per month is free

Cron:
- [Heroku's Scheduler](https://devcenter.heroku.com/articles/scheduler)
- [AWS CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html)

Fire off scripts:
- Heroku: More difficult
- AWS Lambda: Just fire off a lambda

Pros of AWS:
- Infrastructure as code

Pricing:
  - AWS
    - https://aws.amazon.com/api-gateway/pricing/
    - https://aws.amazon.com/dynamodb/pricing/
    - https://aws.amazon.com/lambda/pricing/
    - https://aws.amazon.com/route53/pricing/
    - https://aws.amazon.com/s3/pricing/

## Other Notes

- https://www.meetup.com/meetup_api/docs/:urlname/events/#list
- https://secure.meetup.com/meetup_api/console/?path=/:urlname/events
- https://developers.facebook.com/docs/graph-api/reference/event/
- https://developers.facebook.com/docs/graph-api/reference/page/events/
- https://developers.facebook.com/docs/graph-api/reference/group/events/
- https://developers.facebook.com/tools/explorer/
- https://developers.facebook.com/tools/debug/accesstoken/
- https://github.com/node-facebook/facebook-node-sdk
- https://hub.docker.com/r/amazon/dynamodb-local
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html
- https://auth0.com/
- https://github.com/serverless/examples/tree/master/aws-node-graphql-api-with-dynamodb
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-indexes-general.html
- https://facebook.github.io/relay/docs/en/pagination-container.html
- https://github.com/cristiancmello/react-app-serverless/blob/master/backend/serverless.yml
- https://cloudhut.io/how-to-setup-proxy-passthrough-on-api-gateway-console-cloudformation-55e923d02b9
- https://gist.github.com/og24715/31abb1782ea9d3cc3132d443eb252075
- https://stackoverflow.com/questions/51464084/how-to-create-an-api-gateway-http-proxy-without-any-lambda-function

- It seems the lambda runs out of memory, without informing me...
  - Returns a 200 success...

## In this repo

- Getting GraphQL and GraphQLi working with AWS Lambda and DynamoDB
  - GraphQL on TypeScript
- Relay on create-react-app

## What I needed to understand to accomplish this

- DynamoDB
  - Patition Keys cannot be updated
- GraphQL on DynamoDB
- GraphQL on Lambda
- GraphQL with TypeScript
- Relay on Create React App
- Use of Webpack on Lambda really increases memory size
