'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');
const { batchRiver } = require('./utils');
const { hasOwnProperty } = Object.prototype;
const MAX_BATCH_SIZE = 25;

/*
  This method returns a "batchWriterAgent", which is used to perform efficient
  put/delete requests. When you instruct the agent to perform a put/delete, it
  buffers the request and waits for more requests (25 total) before sending a
  batch request to DynamoDB. If the timeout parameter is given, it will not
  buffer requests for longer than the specified number of milliseconds.

  The agent has two methods for buffering requests:
    #put(tableName: string, item: object)
    #delete(tableName: string, key: object)

  The agent also has a #getResults() method, which returns a river containing
  the result of each batch request.
  If the corresponding batch request had:
    - failed, the result will be { error: <Error>, count: <number> }
    - succeeded, the result will be { count: <number>, ...<DynamoDB-response> }

  For successful batch requests, the `UnprocessedItems` field will always be
  empty. The agent automatically handles unprocessed items via retries.
 */

module.exports = (dynaflow) => {
  dynaflow.batchWriteItem = wrap(Promise.promisify(dynaflow.db.batchWriteItem));
  return dynaflow;
};

const wrap = method => function batchWriteItem(params = {}, timeout = null) {
  if (!Number.isNaN(parseFloat(params))) { timeout = params; params = {}; }
  if (timeout !== null && ~~timeout !== timeout) throw new TypeError('Expected timeout to be an integer or null');
  params = Object.assign({}, params);

  let write;
  const input = new River((_, __, w) => { write = w; });
  const outputs = new Set();
  batchRiver(input, MAX_BATCH_SIZE, timeout, batchingLogic)
    .map((RequestItems) => {
      params.RequestItems = RequestItems;
      return method.call(this.db, params)
        .then((result) => {
          const { UnprocessedItems } = result;
          result.UnprocessedItems = {};
          const attempted = count(RequestItems);
          const failed = count(UnprocessedItems);
          result.count = attempted - failed;
          if (failed !== 0) retry(UnprocessedItems, write);
          return result;
        }, (error) => {
          return { error, count: count(RequestItems) };
        });
    })
    .consume((result) => {
      for (const output of outputs) output(result);
    });

  const addToBatch = (tableName, item) => {
    if (typeof tableName !== 'string') throw new TypeError('Expected table name to be a string');
    if (tableName === '') throw new TypeError('Table name cannot be an empty string');
    if (item === null || typeof item !== 'object') throw new TypeError('Expected the second parameter to be an object');
    if (Promise.isPromise(item)) throw new TypeError('Cannot write a promise to a batch request');
    write({ tableName, item });
  };

  return {
    getResults: () => new River((_, __, w, f) => { outputs.add(w); f(() => outputs.delete(w)); }),
    put: (tableName, Item) => addToBatch(tableName, { PutRequest: { Item } }),
    delete: (tableName, Key) => addToBatch(tableName, { DeleteRequest: { Key } }),
  };
};

const batchingLogic = (batch, { tableName, item }) => {
  if (hasOwnProperty.call(batch, tableName)) batch[tableName].push(item);
  else batch[tableName] = [item];
};

const count = (RequestItems) => {
  return Object.keys(RequestItems).reduce((total, key) => total + RequestItems[key].length, 0);
};

const retry = (RequestItems, write) => {
  for (const tableName of Object.keys(RequestItems)) {
    for (const item of RequestItems[tableName]) write({ tableName, item });
  }
};
