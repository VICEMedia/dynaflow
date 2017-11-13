'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const River = require('wise-river');
const Promise = require('wise-promise');
const { PutRequest } = require('../lib/request');
const wrap = require('../lib/batch_write_item');
const { dynaflow, createTestingTable, range } = require('./helpers');

describe('batch_write_item', function () {
  beforeEach(() => {
    return createTestingTable({ TableName: 'testing' });
  });

  it('sends batches of writes to dynamo', function () {
    return dynaflow.batchWriteItem(new River((resolve, reject, write) => {
      range(50).forEach((i) => {
        write(new PutRequest('testing', { id: { S: 'abc' }, timestamp: { N: `${i}` } }));
      });
      resolve();
    })).consume(batch => batch.send().then((res) => {
      expect(res).to.deep.equal({ count: 25, UnprocessedItems: {} });
    }))
      .then(() => dynaflow.scan({ TableName: 'testing', itemsOnly: true }).all())
      .then((res) => {
        expect(res).to.have.lengthOf(50);
        range(50).forEach((i) => {
          expect(res[i]).to.deep.equal({ id: { S: 'abc' }, timestamp: { N: `${i}` } });
        });
      });
  });

  it('sends batches of writes to dynamo using a timeout', function () {
    return dynaflow.batchWriteItem(new River((resolve, reject, write) => {
      write(new PutRequest('testing', { id: { S: 'abc' }, timestamp: { N: '1' } }));
      return Promise.after(120)
        .then(() => dynaflow.scan({ TableName: 'testing', itemsOnly: true }).all()
          .then((res) => {
            expect(res).to.have.lengthOf(1);
            expect(res[0]).to.deep.equal({ id: { S: 'abc' }, timestamp: { N: '1' } });
          }))
        .then(resolve);
    }), { timeout: 100 }).consume(batch => batch.send().then((res) => {
      expect(res).to.deep.equal({ count: 1, UnprocessedItems: {} });
    }));
  });

  // I don't believe there's a good way of testing UnprocessedItems logic with dynamodb
  // local so here we'll use a mock instead
  describe('UnprocessedItems', function () {
    beforeEach(function () {
      this.requests = [];
      sinon.stub(dynaflow.db, 'batchWriteItem').callsFake(({ RequestItems }, cb) => {
        this.requests.push(RequestItems);
        const UnprocessedItems = {};
        // Don't process half of the requested items until there is only one left
        const requested = RequestItems.testing;
        if (requested.length > 1) {
          UnprocessedItems.testing = requested.slice(Math.floor(requested.length / 2));
        }
        cb(null, { UnprocessedItems });
      });
      wrap(dynaflow);
    });

    afterEach(function () {
      dynaflow.db.batchWriteItem.restore();
      wrap(dynaflow);
    });

    it('handles unprocessed items', function () {
      return dynaflow.batchWriteItem(new River((resolve, reject, write) => {
        range(10).forEach((i) => {
          write(new PutRequest('testing', { id: { S: 'abc' }, timestamp: { N: `${i}` } }));
        });
        resolve();
      })).consume(batch => batch.send())
        .then(() => {
          expect(this.requests).to.deep.equal([
            {
              testing: [
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '0' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '1' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '2' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '3' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '4' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '5' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '6' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '7' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '8' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '9' } } } },
              ],
            },
            {
              testing: [
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '5' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '6' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '7' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '8' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '9' } } } },
              ],
            },
            {
              testing: [
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '7' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '8' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '9' } } } },
              ],
            },
            {
              testing: [
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '8' } } } },
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '9' } } } },
              ],
            },
            {
              testing: [
                { PutRequest: { Item: { id: { S: 'abc' }, timestamp: { N: '9' } } } },
              ],
            },
          ]);
        });
    });
  });
});
