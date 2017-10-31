'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');
const MAX_BATCH_SIZE = 25;

/*
  This method is a wrapper around batchWriteItem() that TODO
 */

module.exports = (dynaflow) => {
  dynaflow.batchWriteItem = wrap(Promise.promisify(dynaflow.db.batchWriteItem));
  return dynaflow;
};

const wrap = method => function batchWriteItem(timeout = null, params) {
  // TODO
  // const river = new River((resolve, reject, write, free) => {
  // });
};
