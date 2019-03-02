import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda';
import { fetchFacebookOrganizationEvents } from './facebook';
import {
  fetchAll as fetchAllMeetupOrganizations,
  createOrUpdateOrganization as createOrUpdateMeetupOrganization,
  fetchOrganizationEvents as fetchOrganizationMeetupEvents,
} from './meetup';
import { writeBatchItems } from './utils';

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

export const meetupAllOrganizations: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const results = await fetchAllMeetupOrganizations();

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const meetupOrganization: APIGatewayProxyHandler = async (event: any) => {
  const {
    urlname,
    region,
  } = event;
  const meetup = await createOrUpdateMeetupOrganization(urlname, region);
  const events = await fetchOrganizationMeetupEvents(urlname, region, "future_or_past");

  return {
    statusCode: 200,
    body: JSON.stringify({
      meetup,
      events,
    }),
  };
}
