import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda';
import {
  fetchAll as fetchAllFacebookOrganizations,
  createOrUpdateOrganization as createOrUpdateFacebookOrganization,
  createOrUpdateEvent as createOrUpdateFacebookEvent,
} from './facebook';
import {
  fetchAll as fetchAllMeetupOrganizations,
  createOrUpdateOrganization as createOrUpdateMeetupOrganization,
  fetchOrganizationEvents as fetchOrganizationMeetupEvents,
} from './meetup';

export const facebookAllOrganizations: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const results = await fetchAllFacebookOrganizations();

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const facebookOrganization: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const data = JSON.parse(event.body);
  const results = await createOrUpdateFacebookOrganization(data.id, data.region);

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const facebookEvent: APIGatewayProxyHandler = async (event : APIGatewayEvent) => {
  const data = JSON.parse(event.body);
  const results = await createOrUpdateFacebookEvent(data.id, data.region);

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
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
