'use strict';
const { expect } = require('chai');
const batchRiver = require('../lib/batch_river');
const River = require('wise-river');
const Promise = require('wise-promise');

function testableBatchRiver(input, maxSize = 5, timeout = null, handler = null) {
  const batches = [];
  if (handler === null) {
    handler = (batch, feedback) => {
      batches.push(batch);
      feedback();
    };
  }

  return batchRiver(new River(input), maxSize, timeout, handler).drain().then(() => batches);
}

describe('batch_river', function () {
  it('batches input', function () {
    return testableBatchRiver((resolve, reject, write) => {
      write({ TableName: 'foo1', Item: 1 });
      write({ TableName: 'foo2', Item: 2 });
      write({ TableName: 'foo3', Item: 3 });
      write({ TableName: 'foo4', Item: 4 });
      write({ TableName: 'foo5', Item: 5 });
      write({ TableName: 'foo5', Item: 6 });
      write({ TableName: 'foo7', Item: 7 });
      resolve();
    }, 2, null).then((batches) => {
      expect(batches).to.deep.equal([
        { foo1: [1], foo2: [2] },
        { foo3: [3], foo4: [4] },
        { foo5: [5, 6] },
        { foo7: [7] },
      ]);
    });
  });

  it('batches using a timeout', function () {
    return testableBatchRiver((resolve, reject, write) => {
      write({ TableName: 'foo1', Item: 1 });
      return Promise.after(120)
        .then(() => write({ TableName: 'foo2', Item: 2 }))
        .then(() => Promise.after(120))
        .then(() => write({ TableName: 'foo3', Item: 3 }))
        .then(() => Promise.after(120))
        .then(() => {
          write({ TableName: 'foo4', Item: 4 });
          write({ TableName: 'foo5', Item: 5 });
          resolve();
        });
    }, 100, 100).then((batches) => {
      expect(batches).to.deep.equal([
        { foo1: [1] },
        { foo2: [2] },
        { foo3: [3] },
        { foo4: [4], foo5: [5] },
      ]);
    });
  });

  it('allows you to feedback entries', function () {
    let callCount = 0;
    const handler = (batch, feedback) => {
      if (callCount === 0) {
        callCount++;
        expect(batch).to.deep.equal({ foo1: [1], foo2: [2], foo3: [3] });
        feedback([{ TableName: 'newFoo', Item: 1 }]);
      } else {
        callCount++;
        expect(batch).to.deep.equal({ newFoo: [1] });
        feedback();
      }
    };
    return testableBatchRiver((resolve, reject, write) => {
      write({ TableName: 'foo1', Item: 1 });
      write({ TableName: 'foo2', Item: 2 });
      write({ TableName: 'foo3', Item: 3 });
      resolve();
    }, 5, null, handler).then(() => expect(callCount).to.equal(2));
  });

  it('raises rejections from the input', function () {
    return testableBatchRiver((resolve, reject) => {
      reject(new Error('A big error!'));
    }).then(() => {
      throw new Error('River should not have resolved');
    }, (err) => {
      expect(err).to.be.an('error');
      expect(err.message).to.equal('A big error!');
    });
  });
});
