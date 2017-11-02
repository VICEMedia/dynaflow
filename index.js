'use strict';
const { DynamoDB } = require('aws-sdk');
const wrapped = require('./lib/wrapped');
const paginated = require('./lib/paginated');
const batchWriteItem = require('./lib/batch_write_item');

function Dynaflow(options) {
  if (new.target !== Dynaflow) return new Dynaflow(options);
  this.db = new DynamoDB(options);
  wrapped(this);
  paginated(this);
  batchWriteItem(this);
}

module.exports = Dynaflow;
