import fetch from 'node-fetch';
import { promisify } from 'util';

// TODO I can't reassign a variable to `queryPromise` in typescript
// from https://stackoverflow.com/questions/50391825/cant-insert-data-into-dynamodb-using-new-nodejs-8-10
const { client: dynamodb } = require('./dynamodb');
dynamodb.scanPromise = promisify(dynamodb.scan);
dynamodb.putPromise = promisify(dynamodb.put);

interface IGroup {
  meetup_id: string,
  region: string,
}

const handleMeetupResponseErrors = (json) => {
  const errors = [];
  for (const error of json.errors) {
    errors.push(error.message);
  }

  return errors.join(', ');
}

export const createOrUpdateOrganization = async (meetup_id: string, region: string) => {
  const response = await fetch(`https://api.meetup.com/${meetup_id}`);
  const json = await response.json();;

  if (json.errors) {
    throw new Error(handleMeetupResponseErrors(json));
  }

  await dynamodb.putPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    Item: {
      id: `meetup:${meetup_id}`,
      meetup_id,
      name:  json.name,
      source: `meetup`,
      updated_at: new Date().toISOString(),
      raw: JSON.stringify(json),
      region,
    },
  });

  return { meetup_id };
}

const placeFromEvent = (data) => {
  if (!data.venue) {
    return {
       place: data.group.localized_location,
    };
  }

  return {
    venue: data.venue.name,
    place: data.venue.address_1,
    city: data.venue.city,
    country: data.venue.localized_country_name,
  };
}

export const createOrUpdateEventResponse = async ({ region }, event) => {
  const id = `meetup:${event.id}`;

  const {
    venue,
    place,
    city,
    country,
  } = placeFromEvent(event);

  const start_time = new Date(event.time);
  const end_time = new Date(
    event.duration
      ? (event.duration + event.time)
    : event.time
  );

  const status = end_time < new Date()
    ? 'past'
    : 'upcoming';

  await dynamodb.putPromise({
    TableName: process.env.EVENTS_TABLE,
    Item: {
      name: event.name,
      description: event.description,
      link: event.link,
      source: "meetup",
      meetup_id: event.id,
      id,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      status,
      venue,
      place,
      city,
      country,
      region,
      updated_at: new Date().toISOString(),
      raw: JSON.stringify(event),
    },
  });

  return event;
}

export const fetchOrganizationEvents = async (meetup_id : string, region : string) => {
  const response = await fetch(`https://api.meetup.com/${meetup_id}/events?scroll=future_or_past`);
  const json = await response.json();

  if (json.errors) {
    throw new Error(handleMeetupResponseErrors(json));
  }

  const asyncs = json.map(async (event) => 
    createOrUpdateEventResponse({ region }, event)
  );

  return await Promise.all(asyncs);
};

export const fetchAll = async () => {
  // TODO look at using index
  const groups = await dynamodb.scanPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    FilterExpression: "#s = :source",
    ExpressionAttributeNames: {
      '#s': 'source',
    },
    ExpressionAttributeValues: {
      ':source': 'meetup',
    },
  });
  
  const asyncs = groups.Items.map(async (group : IGroup) => {
    try {
      await createOrUpdateOrganization(group.meetup_id, group.region);
      return await fetchOrganizationEvents(group.meetup_id, group.region);
    } catch (error) {
      console.error(error);
      return {};
    }
  });

  const results = await Promise.all(asyncs);
  return results;
}
