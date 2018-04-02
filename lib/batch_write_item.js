'use strict';
const Promise = require('wise-promise');
const batchRiver = require('./batch_river');
const { option, omit, keys } = require('./utils');
const MAX_BATCH_SIZE = 25;

/*
  This method takes a river of PutRequests and/or DeleteRequests, batches those
  requests into groups of MAX_BATCH_SIZE, executes those batches by sending
  them to DynamoDB, and returns a river containing the results of each batch
  that is sent. The result object of each request will always have an empty
  `UnprocessedItems` map, becuase this method handles retries automatically.
  Additionally, the result of each request will have a `Count` field, indicating
  the number of Puts/Deletes that were successfully processed. If the request
  results in an error, the associated error object will also have a `Count`
  field for how many items failed.

  If the `Timeout` parameter is given, the incomming PutRequests/DeleteRequests
  will not be buffered for the longer than the specified number of milliseconds.

  If the `Manual` parameter is `true`, the returned river will output each batch
  object without actually sending them to DynamoDB. Each batch object has a
  `send()` method which MUST be used to write the batch to DynamoDB (returning a
  promise for the request).
 */

module.exports = (dynaflow) => {
  dynaflow.batchWriteItem = wrap(Promise.promisify(dynaflow.db.batchWriteItem));
  return dynaflow;
};

const wrap = method => function batchWriteItem(input, params) {
  const manual = !!option(params, 'Manual');
  const timeout = option(params, 'Timeout');
  if (timeout !== null && ~~timeout !== timeout) {
    throw new TypeError('Expected timeout to be an integer or null');
  }
  const sendable = (obj, feedback) => Object.defineProperty(obj, 'send', {
    value: () => formatResult(method.call(this.db, obj), count(obj.RequestItems), feedback),
  });
  params = omit(params, 'Timeout', 'Manual');
  const output = batchRiver(input, MAX_BATCH_SIZE, timeout, (RequestItems, feedback) => {
    return sendable(Object.assign({}, params, { RequestItems }), feedback);
  });
  return manual ? output : output.map(batch => batch.send());
};

const formatResult = (promise, attempted, feedback) => promise
  .then((result) => {
    const { UnprocessedItems } = result;
    result.UnprocessedItems = {};
    result.Count = attempted - count(UnprocessedItems);
    feedback(result.Count !== attempted ? parse(UnprocessedItems) : undefined);
    return result;
  }, (err) => {
    feedback(undefined);
    err.Count = attempted;
    throw err;
  });

const count = (RequestItems) => {
  let total = 0;
  keys(RequestItems, (TableName) => {
    if (RequestItems[TableName] == null) return;
    total += RequestItems[TableName].length >>> 0;
  });
  return total;
};

const parse = (RequestItems) => {
  const requests = [];
  keys(RequestItems, (TableName) => {
    for (const item of RequestItems[TableName]) {
      if (item.PutRequest) requests.push({ TableName, Item: item.PutRequest.Item });
      else if (item.DeleteRequest) requests.push({ TableName, Key: item.DeleteRequest.Key });
    }
  });
  return requests;
};
