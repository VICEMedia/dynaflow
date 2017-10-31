'use strict';
const River = require('wise-river');

/*
  Batch incoming items into an array that gets written out either after the
  specified timeout or when the size equals the configured max size (whichever
  comes first).
 */
exports.batch = (river, { timeout = null, max = 25 } = {}) => new River((resolve, reject, write, free) => {
  const ms = ~~timeout;
  let buffered = [];
  let timer;

  function reset() {
    buffered = [];
    clearTimeout(timer);
    timer = undefined;
  }
  function flush() {
    write(buffered);
    reset();
  }

  free(river.pump((item) => {
    if (buffered.push(item) === max) {
      flush();
    } else if (timeout !== null && buffered.length === 1) {
      timer = setTimeout(flush, ms);
    }
  }));

  river.then(() => {
    if (buffered.length !== 0) flush();
    resolve();
  }, (err) => {
    reset();
    reject(err);
  });
});

/*
  Given a river of query/scan results, returns a river containing all table
  items found within the results.
 */
exports.getItems = river => new River((resolve, reject, write, free) => {
  free(river.pump(({ Items = [] }) => {
    for (const item of Items) write(item);
  }));
  river.then(resolve, reject);
});
