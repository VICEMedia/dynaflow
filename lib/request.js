'use strict';
const Promise = require('wise-promise');
const { hasOwnProperty } = Object.prototype;

/*
  Instances of the Request class represent individual put/delete requests within
  a batch request.
 */

function Request(tableName, item) {
  if (typeof tableName !== 'string') throw new TypeError('Expected table name to be a string');
  if (tableName === '') throw new TypeError('Table name cannot be an empty string');
  if (item === null || typeof item !== 'object') throw new TypeError('Expected the second parameter to be an object');
  if (Promise.isPromise(item)) throw new TypeError('Cannot write a promise to DynamoDB');
  this.TableName = tableName;
}

function PutRequest(tableName, item) {
  if (new.target !== PutRequest) return new PutRequest(tableName, item);
  Request.call(this, tableName, item);
  this.Item = item;
}

function DeleteRequest(tableName, item) {
  if (new.target !== DeleteRequest) return new DeleteRequest(tableName, item);
  Request.call(this, tableName, item);
  this.Key = item;
}

Request.prototype.addToBatch = function addToBatch(batch) {
  const tableName = this.TableName;
  const item =
    hasOwnProperty.call(this, 'Item') ? { PutRequest: { Item: this.Item } } :
    hasOwnProperty.call(this, 'Key') ? { DeleteRequest: { Key: this.Key } } :
    null;
  if (hasOwnProperty.call(batch, tableName)) batch[tableName].push(item);
  else batch[tableName] = [item];
};

Object.setPrototypeOf(PutRequest.prototype, Request.prototype);
Object.setPrototypeOf(DeleteRequest.prototype, Request.prototype);
Object.assign(exports, { PutRequest, DeleteRequest });
