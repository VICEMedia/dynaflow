'use strict';
const { DynamoDB } = require('aws-sdk');
const wrapped = require('./lib/wrapped');
const paginated = require('./lib/paginated');
const batchWriteItem = require('./lib/batch_write_item');

/*
  The methods found on instances of DynamoDB are not available at
  DynamoDB.prototype, so we have to do our bootstrapping on a per-instance basis.
 */

function Dynaflow(options) {
  if (new.target !== Dynaflow) return new Dynaflow(options);
  this.db = new DynamoDB(options);
  wrapped(this); // Attach promise-returning methods
  paginated(this); // Attach river-returning methods
  batchWriteItem(this); // Attach river-returning method
}

module.exports = Dynaflow;
