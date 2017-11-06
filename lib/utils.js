'use strict';
const River = require('wise-river');

/*
  Batch incoming items into an object that gets written out either after the
  specified timeout or when the size equals the configured max size (whichever
  comes first).
 */
exports.batchRiver = (river, maxSize, timeout = null) => new River((resolve, reject, write, free) => {
  const ms = ~~timeout;
  let batch = {};
  let size = 0;
  let timer;

  function flush() {
    write(batch);
    reset();
  }
  function reset() {
    batch = {};
    size = 0;
    clearTimeout(timer);
    timer = undefined;
  }

  free(river.pump((item) => {
    item.addToBatch(batch);
    if (++size === maxSize) flush();
    else if (size === 1 && timeout !== null) timer = setTimeout(flush, ms);
  }));

  river.then(() => {
    if (size !== 0) flush();
    resolve();
  }, (err) => {
    reset();
    reject(err);
  });
});
