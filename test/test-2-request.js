'use strict';
const { expect } = require('chai');
const Promise = require('wise-promise');
const { PutRequest, DeleteRequest } = require('../lib/request');
const { dynaflow, createTestingTable } = require('./helpers');

const batchWriteItem = Promise.promisify(dynaflow.db.batchWriteItem).bind(dynaflow.db);

const Requests = [PutRequest, DeleteRequest];

describe('request', function () {
  describe('PutRequest', function () {
    it('adds the item to the proper field', function () {
      expect(PutRequest('table', { foo: 'bar' }).Item).to.deep.equal({ foo: 'bar' });
    });
  });

  describe('DeleteRequest', function () {
    it('adds the item to the proper field', function () {
      expect(DeleteRequest('table', { foo: 'bar' }).Key).to.deep.equal({ foo: 'bar' });
    });
  });

  describe('Request', function () {
    it('requires a tablename', function () {
      Requests.forEach((req) => {
        expect(() => req(null, {})).to.throw(TypeError);
        expect(() => req('', {})).to.throw(TypeError);
      });
    });

    it('requires an item that is a valid object', function () {
      Requests.forEach((req) => {
        expect(() => req('table')).to.throw(TypeError);
        expect(() => req('table', Promise.resolve())).to.throw(TypeError);
      });
    });

    it('sets the ', function () {
      Requests.forEach((req) => {
        expect(() => req('table')).to.throw(TypeError);
        expect(() => req('table', Promise.resolve())).to.throw(TypeError);
      });
    });

    it('sets the table name', function () {
      Requests.forEach((req) => {
        expect(req('table', {}).TableName).to.equal('table');
      });
    });

    it('batches into valid requests', function () {
      const batch = {};
      PutRequest('testing1', { id: { S: 'abc' }, timestamp: { N: '1' } }).addToBatch(batch);
      PutRequest('testing1', { id: { S: 'abc' }, timestamp: { N: '2' } }).addToBatch(batch);
      PutRequest('testing2', { id: { S: 'abc' }, timestamp: { N: '3' } }).addToBatch(batch);
      PutRequest('testing2', { id: { S: 'abc' }, timestamp: { N: '4' } }).addToBatch(batch);
      DeleteRequest('testing1', { id: { S: '123' }, timestamp: { N: '1' } }).addToBatch(batch);
      DeleteRequest('testing2', { id: { S: '123' }, timestamp: { N: '1' } }).addToBatch(batch);

      expect(batch).to.deep.equal({
        testing1: [
          { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '1' } } } },
          { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '2' } } } },
          { DeleteRequest: { Key: { id: { S: '123' }, timestamp: { N: '1' } } } },
        ],
        testing2: [
          { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '3' } } } },
          { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '4' } } } },
          { DeleteRequest: { Key: { id: { S: '123' }, timestamp: { N: '1' } } } },
        ],
      });

      // We might at well test that it's actually a valid AWS request
      return createTestingTable({ TableName: 'testing1' })
        .then(() => createTestingTable({ TableName: 'testing2' }))
        .then(() => batchWriteItem({ RequestItems: batch }));
    });
  });
});
