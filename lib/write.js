'use strict';

const { DynamoDB } = require('aws-sdk');
const Promise = require('wise-promise');
const River = require('./river');

const batchWriteItemPromise = Promise.promisify(DynamoDB.prototype.batchWriteItem);

/**
 * Execute a batch write to DynamoDb, retrying if items were temporarily unable to be
 * processed. Returns a promise that resolves with the resp from the last executed
 * batch write.
 * @param {object} payload - The payload to send to Amazon. This should be the same format as that
 *    specified in the AWS documentation for "batchWriteItem":
 *    http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
 * @param {number} [maxTries=5] - The maximum number of times to retry sending unprocessed items
 *    before aborting. If set to null we will retry indefinitely
 * @returns {Promise} - A promise that resolves with the response from the last executed
 *    batch write.
 */
function batchWriteUntilComplete(db, payload, maxTries = 5) {
  const batchWriteItem = batchWriteItemPromise.bind(db);
  return batchWriteItem(payload)
    .then((resp) => {
      const { UnprocessedItems } = resp;
      if (Object.keys(UnprocessedItems).length > 0 && (maxTries !== null ? --maxTries > 0 : false)) {
        return batchWriteUntilComplete(db, { RequestItems: UnprocessedItems }, maxTries);
      }
      return resp;
    });
}

/**
 * Parse out either a put or delete request from the passed in object and return in a
 * way that can be used by batchWriteItem. If neither PutRequest nor DeleteRequest
 * are keys in this object and only Item is set then consider it to be a PutRequest.
 * @param {object} event - The event to parse
 * @returns {object} - The parsed object
 */
function parseRequest({ PutRequest, DeleteRequest, Item }) {
  if (PutRequest) {
    return { PutRequest };
  } else if (DeleteRequest) {
    return { DeleteRequest };
  }
  return { PutRequest: { Item } };
}

/**
 * Append an event to a RequestItems object formatted in a way that can be used by
 * batchWriteItem.
 * @param {object} destination - The object to update. If this object has a key called RequestItems
 *    set then we append to that. Otherwise we treat the passed in parameter itself as the RequestItems object.
 * @param {object} event - The event to append to the RequestItems object
 * @returns {object} - The updated RequestItems
 */
function appendToRequestItems(destination, event) {
  const requestItems = destination.RequestItems ? destination.RequestItems : destination;

  const { TableName } = event;
  const request = parseRequest(event);

  if (!(TableName in requestItems)) requestItems[TableName] = [];
  requestItems[TableName].push(request);
  return requestItems;
}

/**
 * Format a batch of items and send them to Dynamo
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {*} batch - Array of items or requests to send to Dynamo.
 * @param {number} [maxTries=5] - The maximum number of times to retry sending unprocessed items
 *    before aborting. If set to null we will retry indefinitely
 */
function writeBatch(db, batch, maxTries = 5) {
  const RequestItems = {};
  batch.forEach(appendToRequestItems.bind(null, RequestItems));
  return batchWriteUntilComplete(db, { RequestItems }, maxTries);
}

/**
 * A helper for sending events out to DynamoDB in batches. Buffers the events
 * until the max number of items comes in or a specified timeout before sending
 * them.
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {*} options - Configuration options
 * @param {*} [options.timeout=40] - The maximum amount of time to wait, in milliseconds,
 *    before writing out what's buffered
 * @param {*} [options.max=25] - The maximum number of items to batch (DynamoDB limit is 25)
 * @param {*} handler - Callback that will be invoked when the bundle is ready to be written
 *    out. Defaults to the `writeBatch` function.
 * @returns {Promise} - A promise with the additional methods:
 *        - write(event): Adds an event to be written to Dynamo
 *        - end(): Signals the end of write operations. Any buffered data will be flushed.
 *                 After calling this calls to .write will raise an exception.
 *        - abort(err): Ends the writer with the given error. Will discard anything buffered.
 *    The promise will resolve after .end is called and all writes are done or throw if .abort is called
 */
function BatchWriter(db, { timeout = 40, max = 25 } = {}, handler = writeBatch.bind(null, db)) {
  let write;
  let resolve;
  let reject;
  let ended = false;

  const writer = new River((res, rej, w) => {
    write = w;
    resolve = res;
    reject = rej;
  });

  const p = writer.batch({ timeout, max }).consume(handler);

  p.write = (event) => {
    if (ended) throw new Error('Write after end');
    write(event);
  };
  p.end = () => {
    ended = true;
    resolve();
  };

  p.abort = reject;

  return p;
}

module.exports.BatchWriter = BatchWriter;
module.exports.writeBatch = writeBatch;
module.exports.batchWriteUntilComplete = batchWriteUntilComplete;
module.exports.batchWriteItem = batchWriteItemPromise;
module.exports.appendToRequestItems = appendToRequestItems;
