'use strict';
const Promise = require('wise-promise');
const batchRiver = require('./batch_river');
const { PutRequest, DeleteRequest } = require('./request');
const MAX_BATCH_SIZE = 25;

/*
  This method takes a river of PutRequests and/or DeleteRequests, batches those
  requests into groups of MAX_BATCH_SIZE, and returns a river containing the
  resulting batches. Each batch has a `send()` method which must be used to
  write the batch to DynamoDB (returning a promise for the request). The result
  of each request will always have an empty `UnprocessedItems` map, becuase this
  method handles retries automatically. Additionally, the result of each request
  will have a `count` field, indicating the number of Puts/Deletes that were
  successfully processed. If the request results in an error, the associated
  error object will also have a `count` field for how many items failed. If the
  `timeout` parameter is given, the incomming PutRequests/DeleteRequests will
  not be buffered for the longer than the specified number of milliseconds.
 */

module.exports = (dynaflow) => {
  dynaflow.batchWriteItem = wrap(Promise.promisify(dynaflow.db.batchWriteItem));
  return dynaflow;
};

const wrap = method => function batchWriteItem(input, params) {
  params = Object.assign({}, params);
  const { timeout = null } = params;
  if (timeout !== null && ~~timeout !== timeout) {
    throw new TypeError('Expected timeout to be an integer or null');
  }
  const sendable = (obj, feedback) => Object.defineProperty(obj, 'send', {
    value: () => formatResult(method.call(this.db, obj), count(obj.RequestItems), feedback),
  });
  return batchRiver(input, MAX_BATCH_SIZE, timeout, (RequestItems, feedback) => {
    return sendable(Object.assign({}, params, { RequestItems }), feedback);
  });
};

const formatResult = (promise, attempted, feedback) => promise
  .then((result) => {
    const { UnprocessedItems } = result;
    result.UnprocessedItems = {};
    result.count = attempted - count(UnprocessedItems);
    feedback(result.count !== attempted ? parse(UnprocessedItems) : undefined);
    return result;
  }, (err) => {
    feedback(undefined);
    err.count = attempted;
    throw err;
  });

const count = (RequestItems) => {
  if (RequestItems == null) return 0;
  return Object.keys(RequestItems).reduce((total, key) => {
    if (RequestItems[key] == null) return total;
    return total + (RequestItems[key].length >>> 0);
  }, 0);
};

const parse = (RequestItems) => {
  const requests = [];
  for (const tableName of Object.keys(RequestItems)) {
    for (const item of RequestItems[tableName]) {
      if (item.PutRequest) requests.push(new PutRequest(tableName, item.PutRequest.Item));
      else if (item.DeleteRequest) requests.push(new DeleteRequest(tableName, item.DeleteRequest.Key));
    }
  }
  return requests;
};
