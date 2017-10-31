'use strict';
const { DynamoDB } = require('aws-sdk');
const wrapped = require('./lib/wrapped');
const paginated = require('./lib/paginated');
const batched = require('./lib/batched');

function Dynaflow(options) {
  if (new.target !== Dynaflow) return new Dynaflow(options);
  this.db = new DynamoDB(options);
  wrapped(this);
  paginated(this);
  batched(this);
}

module.exports = Dynaflow;
