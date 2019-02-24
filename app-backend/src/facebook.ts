import { promisify } from 'util';
import { Facebook } from 'fb';
import { SSM } from 'aws-sdk';
const ssm = new SSM();

// TODO I can't reassign a variable to `queryPromise` in typescript
// from https://stackoverflow.com/questions/50391825/cant-insert-data-into-dynamodb-using-new-nodejs-8-10
const { client: dynamodb } = require('./dynamodb');
dynamodb.queryPromise = promisify(dynamodb.query);
dynamodb.scanPromise = promisify(dynamodb.scan);

interface IFacebookOrganization {
  id: string,
  facebook_id: string,
  region: string,
}

async function fbClient() {
  const response = await ssm.getParameter({
    Name: '/build.my/prod/FACEBOOK_ACCESS_TOKEN',
  }).promise();
  
  const access_token = response['Parameter']['Value'];

  return new Facebook({
    accessToken: access_token,
  });
}

export async function createOrUpdateOrganization(facebook_id: string, region: string) {
  const fb = await fbClient();
  const org = await fb.api(
    facebook_id,
    { fields: ['id', 'name', 'description', 'link'] },
  );

  await dynamodb.putPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    Item: {
      id: `facebook:${org.id}`,
      facebook_id: org.id,
      source: `facebook`,
      updated_at: new Date().toISOString(),
      raw: JSON.stringify(org),
      region,
    },
  });
}

const placeFromEvent = (data) => {
  if (!data.place) {
    // Facebook events don't need a location apparently
    return {
      place: null,
      city: null,
      country: null,
    }
  }
  const place = data.place.name;

  if (!data.place.location) {
    return {
      place,
    }
  }

  const city = data.place.location.city;
  const country = data.place.location.country;

  return {
    place,
    city,
    country
  }
}

export async function createOrUpdateEvent(facebook_id: string, region: string) {
  const fb = await fbClient();
  const event = await fb.api(
    facebook_id,
    { fields: ['id', 'name', 'description', 'start_time', 'end_time', 'place'] },
  );
  await createOrUpdateEventResponse(event, region);
}

async function createOrUpdateEventResponse(event, region: string) {
  const {
    place,
    city,
    country,
  } = placeFromEvent(event);

  // format: 2019-02-22T09:00:00+0800
  const start_time = new Date(event.start_time);
  const end_time = event.end_time
    ? new Date(event.end_time)
    : start_time;

  const status = end_time < new Date()
    ? 'past'
    : 'upcoming';

  await dynamodb.putPromise({
    TableName: process.env.EVENTS_TABLE,
    Item: {
      name: event.name,
      description: event.description,
      link: `https://www.facebook.com/events/${event.id}/`,
      source: "facebook",
      source_id: event.id,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      status,
      id: `facebook:${event.id}`,
      place,
      city,
      country,
      region,
      updated_at: new Date().toISOString(),
      raw: JSON.stringify(event),
    },
  });
}


export async function fetchOrganizationEvents(facebook_id: string, region: string) {
  if (!facebook_id) {
    return;
  }

  const fb = await fbClient();
  const events = await fb.api(`${facebook_id}/events`);
  const asyncs = events.data.map(async (event) => {
    createOrUpdateEventResponse(region, event);
  });

  await Promise.all(asyncs);
}

export const fetchAll = async () => {
  const groups = await dynamodb.queryPromise({
    TableName: process.env.ORGANIZATIONS_TABLE,
    KeyConditionExpression: 'source = :source',
    ExpressionAttributeValues: { ':source': "facebook" },
  });
  
  const asyncs = groups.Items.map(async (group : IFacebookOrganization) => {
    try {
      await createOrUpdateOrganization(group.facebook_id, group.region);
      const json = await fetchOrganizationEvents(group.facebook_id, group.region);
      return json;
    } catch (error) {
      console.error(error);
      return {};
    }
  });

  const results = await Promise.all(asyncs);
  return results;
}
