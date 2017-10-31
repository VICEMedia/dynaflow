'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');

/*
  These methods are ones which handle batches of regular operations in DynamoDB.
 */

module.exports = dynaflow => Object.assign(dynaflow, {
  batchGetItem: wrap(dynaflow.db.batchGetItem),
  batchWriteItem: wrap(dynaflow.db.batchWriteItem),
});

const wrap = (method) => {
  const wrapped = batched(Promise.promisify(method));
  Object.defineProperty(wrapped, 'name', { configurable: true, value: method.name });
  return wrapped;
};

const batched = method => function paginatedMethod(params) {
  return new River((resolve, reject, write, free) => {
    // TODO
  });
};
