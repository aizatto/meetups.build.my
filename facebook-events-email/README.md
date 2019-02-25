# Facebook Events

Facebook disabled scraping their Groups and Pages, so I had to find an alternative.

I noticed I can at least "email" myself events from the Facebook Event's UI.

Goal:

- Receive emails from Facebook containing a `.ics` file with informatino about the event
  - On an Event, next to the "Share" dropdown, is the elipses, click on the "...".
  - Select "Export Event"
  - Select "Send to email" and choose an email
  - Facebook will email an `.ics` file

Stack:

- AWS Lambda
- AWS SES
- AWS S3

Cons:

- `invite.ics` does not contain detailed location information
- You need to mark yourself as "Interested" to the event for the "Export" feature to at least appear.

## TODO

- Delete objects from S3
  - TTL?

## Problem Encountered

Lambdas cannot call lambdas from another region unless you specifically specify the region:


```js
const lambda = new Lambda({
  region: "ap-southeast-1",
});
// Now you can call all lambdas in ap-southeast-1
```

## Design Decisions

### Isolated Directory

I created another `serverless.yml` because the SES lambda has to live in another region, so I thought it would be easier to manage by doing so.

### Storing the Event 

There are a few options:

1. Option 1: Call AWS Lambda function that stores
  - Need to give permission for lambda to call another
  - Can "reuse" logic
2. Option 2: Reuse existing libraries to store `/app-backend/src/facebook.ts`
  - Messy
3. Option 3: Directly store in DynamoDB
  - Messy

I'm going with Option 1 as I think it's the cleanest.

# Setup

Decide on an email address for a domain you own, for example: example@example.com

Configuration:

- Copy `secrets.example.json` to `secrets.json`
- Enter S3 bucket name

## Deploy Lambda

We need to deploy the lambda first so that SES can find it.

Your lambda functions have to exist in same region else you will get permission errors. By default we define `us-east-1` in `serverless.yml`.

See below for SES region availability.

```sh
SLS_DEBUG=* sls deploy -s prod
```

## Setup SES

https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email.html

SES only works on AWS Regions:

| Region                | Region      | MX Record                              |
|-----------------------|-------------|----------------------------------------|
| US East (N. Virginia) | `us-east-1` | `inbound-smtp.us-east-1.amazonaws.com` |
| US West (Oregon)      | `us-west-2` | `inbound-smtp.us-west-2.amazonaws.com` |
| EU (Ireland)          | `eu-west-1  | `inbound-smtp.eu-west-1.amazonaws.com` |

Make sure your DNS is setup correctly. Even using Route53, SES doesn't set it all up for you.

You cannot avoid manually setting up an S3 bucket if you set one up inside SES. SES will also set the proper permission.

## Setup Facebook

Add a new email to Facebook under: Settings > General Account Settings

https://www.facebook.com/settings?tab=account&section=email&view

Go to your S3, find your bucket, download the file, get confirmation code and confirm the email.

## Test Locally

```sh
SLS_DEBUG=* sls invoke local --function parseMessageID --data gch66kd3eham02gih8i90la5ogin1nriqanjq0o1 -s dev
```

```sh
aws lambda invoke --function-name parseMessageID --payload r9ijpafe5co1mcmi6t3b7l8eusb47rv4r6804f01 -r us-east-1 --payload /dev/stdout
```

## Test Production

Go to a Facebook event and test this out

# Test MX Records

```sh
host -t mx $domain
```

# AWS Consoles

- https://console.aws.amazon.com/lambda/
- https://console.aws.amazon.com/route53/
- https://console.aws.amazon.com/s3/buckets/
- https://console.aws.amazon.com/ses/
- https://console.aws.amazon.com/sns/

# URLs

- https://github.com/arithmetric/aws-lambda-ses-forwarder
- https://github.com/serverless/examples/tree/master/aws-node-ses-receive-email-body
  - Example reads from an S3 event `s3:ObjectCreated` vs lambda fired from SES
- https://docs.aws.amazon.com/general/latest/gr/rande.html#ses_region
- https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email.html
- https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-permissions.html
- https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-action-lambda-example-functions.html
- https://www.npmjs.com/package/mailparser
- https://npmcompare.com/compare/ical-expander,node-cal,superhuman-ical.js
  - https://github.com/superhuman/ical.js forked from https://github.com/mozilla-comm/ical.js
  - https://www.npmjs.com/package/@linagora/ical.js
- http://tools.ietf.org/html/rfc5545

- https://stackoverflow.com/questions/35589641/aws-lambda-function-getting-access-denied-when-getobject-from-s3

# TypeScript Bugs

```
ERROR in /Users/aizat/src/build.my/facebook-events-email/handler.ts
./handler.ts
[tsl] ERROR in /Users/aizat/src/build.my/facebook-events-email/handler.ts(6,21)
      TS2339: Property 'Records' does not exist on type 'APIGatewayProxyEvent'.
```
