import { simpleParser } from 'mailparser';
import { S3 } from 'aws-sdk';
import ical2json from 'ical2json';
import iCalDateParser from 'ical-date-parser';
import { promisify } from 'util';
import btoa from 'btoa';

const { Lambda } = require('aws-sdk');

export const parseMessageID = async ({ messageID }) => {
  const lambda = new Lambda({
    region: "ap-southeast-1",
  });

  lambda.invokePromise = promisify(lambda.invoke);

  const s3object = await new S3().getObject({
    Bucket: process.env.S3_BUCKET,
    Key: messageID,
  }).promise();

  const email = await simpleParser(s3object.Body);
  // TODO: add validation

  const promises = email.attachments.map(async (attachment) => {
    if (attachment.contentType != 'text/calendar') {
      return;
    }

    const contents = attachment.content.toString('utf8');
    const json = ical2json.convert(contents);

    // WARNING: Fragile
    const icsEvent = json.VCALENDAR[0]['VEVENT'][0];

    const name = icsEvent['SUMMARY'];
    const link = icsEvent['URL'];
    const venue = icsEvent['LOCATION'];
    const start_time = iCalDateParser(icsEvent['DTSTART']);
    const end_time = iCalDateParser(icsEvent['DTEND']);
    const description = icsEvent['DESCRIPTION'];

    // WARNING: extremely naive, but easy
    const facebook_id = link.match(/(\d+)/)[0];

    await lambda.invokePromise({
      ClientContext: btoa(JSON.stringify({})),
      FunctionName: process.env.LAMBDA_ARN,
      Payload: JSON.stringify({
        body: JSON.stringify({
          facebook_id,
          name,
          description,
          link,
          venue,
          start_time,
          end_time,
          source: 'facebook',
          region: 'kl',
        }),
      }),
    });
  })

  await Promise.all(promises);

  return {
    statusCode: 200,
  };
}

export const fromSES = async (event) => {
  // WARNING: Fragile
  return await parseMessageID({ messageID: event.Records[0].ses.mail.messageId });
}
