'use strict';
const { DynamoDB } = require('aws-sdk');
const wrappers = require('./lib/wrappers');
const paginated = require('./lib/paginated');

function Dynaflow(options) {
  if (new.target !== Dynaflow) return new Dynaflow(options);
  this.db = new DynamoDB(options);
  wrappers(this);
  paginated(this);
}

module.exports = Dynaflow;
