'use strict';
const Promise = require('wise-promise');

/*
  These methods are simply promisified wrappers of their namesakes.
 */

module.exports = dynaflow => Object.assign(dynaflow, {
  createTable: wrap(dynaflow.db.createTable),
  updateTable: wrap(dynaflow.db.updateTable),
  deleteTable: wrap(dynaflow.db.deleteTable),
  getItem: wrap(dynaflow.db.getItem),
  putItem: wrap(dynaflow.db.putItem),
  updateItem: wrap(dynaflow.db.updateItem),
  deleteItem: wrap(dynaflow.db.deleteItem),
  describeTable: wrap(dynaflow.db.describeTable),
  describeLimits: wrap(dynaflow.db.describeLimits),
  describeTimeToLive: wrap(dynaflow.db.describeTimeToLive),
  tagResource: wrap(dynaflow.db.tagResource),
  untagResource: wrap(dynaflow.db.untagResource),
  waitFor: wrap(dynaflow.db.waitFor),
  updateTimeToLive: wrap(dynaflow.db.updateTimeToLive),
});

const wrap = (method) => {
  const promisified = Promise.promisify(method);
  function wrapped(...args) { return promisified.apply(this.db, args); }
  Object.defineProperty(wrapped, 'name', { configurable: true, value: method.name });
  Object.defineProperty(wrapped, 'length', { configurable: true, value: method.length - 1 });
  return wrapped;
};
