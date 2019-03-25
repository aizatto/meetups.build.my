import { APIGatewayProxyHandler } from 'aws-lambda';
import { fetchFacebookOrganizationEvents } from './facebook';
import {
  fetchAll as fetchAllMeetupOrganizations,
  fetchMeetupOrganization,
  fetchMeetupEvent,
  fetchOrganizationMeetupEvents,
} from './meetup';
import { writeBatchItems, writeBatchTables } from './utils';
import { flatten } from 'underscore';

export const facebookOrganization: APIGatewayProxyHandler = async () => {
  const facebook_id = '397934987666525';

  const items = await fetchFacebookOrganizationEvents(facebook_id);
  await writeBatchItems(
    process.env.EVENTS_TABLE,
    items,
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
    }),
  };
}

export const meetupAllOrganizations: APIGatewayProxyHandler = async () => {
  const results = await fetchAllMeetupOrganizations();
  await writeBatchItems(
    process.env.EVENTS_TABLE,
    flatten(results),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  };
}

export const meetupEvent : APIGatewayProxyHandler = async (event: any) => {
  const {
    url,
    region,
  } = event;
  const result = await fetchMeetupEvent(url, region);
  const response = await writeBatchItems(
    process.env.EVENTS_TABLE,
    [result],
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      response
    }),
  };
}

export const meetupOrganization: APIGatewayProxyHandler = async (event: any) => {
  const {
    urlname,
    region,
  } = event;
  const meetup = await fetchMeetupOrganization(urlname, region);
  const events = await fetchOrganizationMeetupEvents(urlname, region, "future_or_past");

  const response = await writeBatchTables([
    {
      TableName: process.env.ORGANIZATIONS_TABLE,
      RequestItems: [meetup],
    },
    {
      TableName: process.env.EVENTS_TABLE,
      RequestItems: events,
    },
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify({
      meetup,
      events,
      response,
    }),
  };
}
