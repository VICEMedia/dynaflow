'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');
const MAX_BATCH_SIZE = 100;

/*
  This method is a wrapper around batchGetItem() that TODO
 */

module.exports = (dynaflow) => {
  dynaflow.batchGetItem = wrap(Promise.promisify(dynaflow.db.batchGetItem));
  return dynaflow;
};

const wrap = method => function batchGetItem(timeout = null, params) {
  // TODO
  // const river = new River((resolve, reject, write, free) => {
  // });
};
