'use strict';
const { DynamoDB } = require('aws-sdk');
const wrapped = require('./lib/wrapped');
const paginated = require('./lib/paginated');
const batchGetItem = require('./lib/batch_get_item');
const batchWriteItem = require('./lib/batch_write_item');

function Dynaflow(options) {
  if (new.target !== Dynaflow) return new Dynaflow(options);
  this.db = new DynamoDB(options);
  wrapped(this);
  paginated(this);
  batchGetItem(this);
  batchWriteItem(this);
}

module.exports = Dynaflow;
