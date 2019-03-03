import { chunk } from 'underscore';
const { client: dynamodb } = require('./dynamodb');

const CHUNK = 25;

export async function writeBatchItems(table: string, all_items: Event[]) {
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

  // TODO handle UnprocessedItems
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html#DDB-BatchWriteItem-response-UnprocessedItems

  await Promise.all(chunks);
}

export async function writeBatchTables(tables: Table[]) {
  let requests = [];

  let RequestItems = {};
  let batchSize = 0;

  for (const table of tables) {
    const { TableName } = table;

    for (const item of table.RequestItems) {
      if (!RequestItems[TableName]) {
        RequestItems[TableName] = [];
      }

      RequestItems[TableName].push({
        PutRequest: {
          Item: item,
        }
      });

      batchSize += 1;

      if (batchSize === 25) {
        batchSize = 0;
        requests.push({
          RequestItems,
        });
      }
    }
  }

  // TODO handle UnprocessedItems
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html#DDB-BatchWriteItem-response-UnprocessedItems

  return await Promise.all(requests.map(async (params) => {
    return await dynamodb.batchWritePromise(params);
  }));
}
