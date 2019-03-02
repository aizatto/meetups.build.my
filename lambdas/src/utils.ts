import { chunk } from 'underscore';
const { client: dynamodb } = require('./dynamodb');

const CHUNK = 25;

export async function writeBatchItems(table: string, all_items: Array<Event>) {
  const chunks = chunk(all_items, CHUNK).map(async (items) => {
    const RequestItems = items.map((item) => {
      return {
        PutRequest: {
          Item: item,
        }
      }
    });

    const params = {
      RequestItems: {
        [table]: RequestItems,
      }
    };

    const response = await dynamodb.batchWritePromise(params);
    return response;
  })

  await Promise.all(chunks);
}
