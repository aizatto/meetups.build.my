import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda';

const { client: dynamodb } = require('./dynamodb');

/**
 * Called by `facebook-events-ses`
 */
export const createEvent: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const data = JSON.parse(event.body);

  data.id = `facebook:${data.facebook_id}`
  data.source = "facebook";
  data.updated_at = new Date().toISOString();
  data.status = "upcoming";

  const results = await dynamodb.putPromise({
    TableName: process.env.EVENTS_TABLE,
    Item: data,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      results,
    }),
  };
}

export const updateEventsUpcomingToPast: APIGatewayProxyHandler = async () => {
  const response = await dynamodb.queryPromise({
    TableName: process.env.EVENTS_TABLE,
    IndexName: process.env.EVENTS_END_TIME_INDEX,
    KeyConditionExpression: "#s = :status AND #e <= :end_time",
    ExpressionAttributeNames:{
      "#s": "status",
      "#e": "end_time",
    },
    ExpressionAttributeValues: {
      ":status": "upcoming",
      ":end_time": new Date().toISOString(),
    },
    ProjectionExpression: "id",
  });

  // We can use either a single BatchWriteItem or multiple UpdateItems
  const promises = response.Items.map((event) =>
    dynamodb.updatePromise({
      TableName: process.env.EVENTS_TABLE,
      Key: {
        id: event.id,
      },
      UpdateExpression: "SET #s = :status",
      ExpressionAttributeNames:{
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":status": "past",
      },
    })
  );

  await Promise.all(promises);

  return {
    statusCode: 200,
    body: `${promises.length} events updated`,
  }
}
