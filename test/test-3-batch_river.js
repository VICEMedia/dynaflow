'use strict';
const { expect } = require('chai');
const batchRiver = require('../lib/batch_river');
const River = require('wise-river');
const Promise = require('wise-promise');

function Batchable(id, value) {
  this.addToBatch = (batch) => {
    batch[id] = value;
  };
}

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
      write(new Batchable(1, 'foo1'));
      write(new Batchable(2, 'foo2'));
      write(new Batchable(3, 'foo3'));
      write(new Batchable(4, 'foo4'));
      write(new Batchable(5, 'foo5'));
      write(new Batchable(6, 'foo6'));
      write(new Batchable(7, 'foo7'));
      resolve();
    }, 2, null).then((batches) => {
      expect(batches).to.deep.equal([
        { 1: 'foo1', 2: 'foo2' },
        { 3: 'foo3', 4: 'foo4' },
        { 5: 'foo5', 6: 'foo6' },
        { 7: 'foo7' },
      ]);
    });
  });

  it('batches using a timeout', function () {
    return testableBatchRiver((resolve, reject, write) => {
      write(new Batchable(1, 'foo1'));
      return Promise.after(120)
        .then(() => write(new Batchable(2, 'foo2')))
        .then(() => Promise.after(120))
        .then(() => write(new Batchable(3, 'foo3')))
        .then(() => Promise.after(120))
        .then(() => {
          write(new Batchable(4, 'foo4'));
          write(new Batchable(5, 'foo5'));
          resolve();
        });
    }, 100, 100).then((batches) => {
      expect(batches).to.deep.equal([
        { 1: 'foo1' },
        { 2: 'foo2' },
        { 3: 'foo3' },
        { 4: 'foo4', 5: 'foo5' },
      ]);
    });
  });

  it('allows you to feedback entries', function () {
    let callCount = 0;
    const handler = (batch, feedback) => {
      if (callCount === 0) {
        callCount++;
        expect(batch).to.deep.equal({ 1: 'foo1', 2: 'foo2', 3: 'foo3' });
        feedback([new Batchable(1, 'newFoo')]);
      } else {
        callCount++;
        expect(batch).to.deep.equal({ 1: 'newFoo' });
        feedback();
      }
    };
    return testableBatchRiver((resolve, reject, write) => {
      write(new Batchable(1, 'foo1'));
      write(new Batchable(2, 'foo2'));
      write(new Batchable(3, 'foo3'));
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
