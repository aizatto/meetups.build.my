import { APIGatewayProxyHandler } from 'aws-lambda';
import fetch from 'node-fetch';
import { parse as urlParser } from 'url';
import iCalDateParser from 'ical-date-parser';

const { client: dynamodb } = require('./dynamodb');

export const peatix: APIGatewayProxyHandler = async (event: any) => {
  const {
    url,
    region,
  } = event;

  let response = await fetch(url);
  let body = await response.text();

  const id = body.match(/peatix:\/\/peatix\.com\/event\/(\d+)/)[1];

  const google_calendar_url = body.match(/href="([^"]+)" data-calendar-type=\"google\"/)[1];
  const parsed_url = urlParser(google_calendar_url, true);
  console.log(parsed_url.query);

  const name = parsed_url.query.text;
  const description = parsed_url.query.details;
  const venue = parsed_url.query.location;
  // We call `toString` to appeal to TypeScript
  const dates = parsed_url.query.dates.toString();
  const [start_time, end_time] = dates.split('/').map(date => new Date(iCalDateParser(date)).toISOString());

  const Item = {
    id: `peatix:${id}`,
    source: "peatix",
    updated_at: new Date().toISOString(),
    status: "upcoming",
    link: url,
    region,
    name,
    description,
    venue,
    start_time,
    end_time,
  };

  await dynamodb.putPromise({
    TableName: process.env.EVENTS_TABLE,
    Item,
  });

  /*
  import ical2json from 'ical2json';
  import iCalDateParser from 'ical-date-parser';
  const calendar_url = `https://peatix.com/event/${id}/download_calendar`;
  response = await fetch(calendar_url);
  body = await response.text();

  const json = ical2json.convert(body);
  const icsEvent = json.VCALENDAR[0]['VEVENT'][0];
  console.log(icsEvent);

  const name = icsEvent['SUMMARY'];
  const link = url;
  const venue = icsEvent['LOCATION'];
  const start_time = iCalDateParser(icsEvent['DTSTART;TZID=UTC']);
  const end_time = iCalDateParser(icsEvent['DTEND;TZID=UTC']);
  const description = icsEvent['DESCRIPTION'];
   */

  return {
    statusCode: 200,
    body: JSON.stringify(Item),
  };
}
