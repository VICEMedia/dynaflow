'use strict';
const River = require('wise-river');
const { hasOwnProperty } = Object.prototype;
const noop = () => {};

/*
  Batch incoming items into an object that gets written out either after the
  specified timeout or when the size equals the configured max size (whichever
  comes first). Items are transformed through the given `handler` before being
  written out. The `handler` function must never throw an error. The handler's
  second argument is a function that must be invoked once per batch. Using this
  function, you can provide an array of items to be fed back into the batcher.
  If no items need to be fed back, invoke it with `undefined`.
 */
module.exports = (input, maxSize, timeout = null, handler) => new River((resolve, reject, write, free) => {
  const ms = ~~timeout;
  let batch = {};
  let size = 0;
  let timer;

  let pendingFeedback = 0;
  let fResolve;
  let fWrite;
  const feedback = new River((r, _, w) => { fResolve = r; fWrite = w; });
  const combined = River.combine(input, feedback);

  let inputDone = false;
  input.then(() => {
    inputDone = true;
    checkIfDone();
  }, noop);
  function checkIfDone() {
    if (inputDone && pendingFeedback === 0) {
      if (size === 0) fResolve();
      else flush();
    }
  }

  function makeFeedbackHandler() {
    pendingFeedback += 1;
    let gaveFeedback = false;
    return (fedback) => {
      if (gaveFeedback) return;
      gaveFeedback = true;
      pendingFeedback -= 1;
      if (Array.isArray(fedback)) {
        for (const item of fedback) fWrite(item);
      }
      checkIfDone();
    };
  }

  function flush() {
    const finishedBatch = batch;
    reset();
    write(handler(finishedBatch, makeFeedbackHandler()));
  }
  function reset() {
    batch = {};
    size = 0;
    clearTimeout(timer);
    timer = undefined;
  }

  free(combined.pump((item) => {
    addToBatch(batch, item);
    if (++size === maxSize) flush();
    else if (size === 1 && timeout !== null) timer = setTimeout(flush, ms);
  }));

  combined.then(resolve, (err) => {
    reset();
    inputDone = false;
    reject(err);
  });
});

const addToBatch = (batch, item) => {
  /* eslint-disable indent */
  if (item == null) throw new TypeError(`Expected batch item to be an object (got ${item})`);
  if (typeof item !== 'object') throw new TypeError(`Expected batch item to be an object (got ${typeof item})`);
  const { TableName } = item;
  if (typeof TableName !== 'string') throw new TypeError('Expected TableName to be a string');
  if (TableName === '') throw new TypeError('TableName cannot be an empty string');
  const request =
    hasOwnProperty.call(item, 'Item') ? { PutRequest: { Item: item.Item } } :
    hasOwnProperty.call(item, 'Key') ? { DeleteRequest: { Key: item.Key } } :
    null;
  if (request === null) throw new TypeError('Invalid batch item (expected a `Key` or `Item` property)');
  if (hasOwnProperty.call(batch, TableName)) batch[TableName].push(request);
  else batch[TableName] = [request];
  /* eslint-enable indent */
};
