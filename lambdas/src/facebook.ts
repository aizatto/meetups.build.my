import { Facebook } from 'fb';
import { SSM } from 'aws-sdk';
const ssm = new SSM();

const EVENT_FIELDS = ['id', 'name', 'description', 'start_time', 'end_time', 'place'];

async function fbClient() {
  const response = await ssm.getParameter({
    Name: '/build.my/prod/FACEBOOK_ACCESS_TOKEN',
  }).promise();
  
  const access_token = response['Parameter']['Value'];

  return new Facebook({
    accessToken: access_token,
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

function mapEventToDynamoDBItem(event: Event) {
  const {
    place,
    city,
    country,
  } = placeFromEvent(event);

  // TODO: we need to make this smarter
  const region = 'kl';

  // format: 2019-02-22T09:00:00+0800
  const start_time = new Date(event.start_time);
  const end_time = event.end_time
    ? new Date(event.end_time)
    : start_time;

  const status = end_time < new Date()
    ? 'past'
    : 'upcoming';

  return {
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
  };
}

export async function fetchFacebookOrganizationEvents(facebook_id: string) {
  const fb = await fbClient();
  const events = await fb.api(
    `${facebook_id}/events`,
    { fields: EVENT_FIELDS, },
  );
  return events.data.map((event) => mapEventToDynamoDBItem(event));
}
