'use strict';

const River = require('wise-river');

/**
 * Calls the passed in callback for each element in the river. Similar in use to
 * River.prototype.map, the difference being that instead of forwarding the results
 * of the handler to a new river, this function passes in the new river's write function
 * to the handler, allowing the handler to easily emit multiple elements for each incoming
 * item or none at all.
 * @param {fn(item, write)} handler - The function to call for each incoming item. The function
 *    will be passed the item and a write function to which elements can be passed to a new stream.
  * @returns {WiseRiver} - A WiseRiver that outputs the items written out by the handler
 */
River.prototype.transform = function (handler) {
  return new River((resolve, reject, write, free) => {
    free(this.pump((item) => {
      const returned = handler(item, write);
      if (Promise.isPromise(returned)) {
        return Promise.resolve(returned);
      }
      return undefined;
    }));
    this.then(resolve, reject);
  });
};

/**
 * Batch incoming items into an array that gets written out either after the specified
 * timeout or when the size equals the configured max size. Whichever comes first.
 * @param {object} options - Configuration options
 * @param {number} [options.timeout=null] - The maximum amount of time to wait before outputting
 *    the buffered content. If null this will never trigger.
 * @param {number} [options.max=25] - The maximum number of items to buffer before emitting
 *    as a batch.
 * @returns {WiseRiver} - A WiseRiver that outputs a batch of items after they've been accumulated
 *    from downstream.
 */
River.prototype.batch = function ({ timeout = null, max = 25 } = {}) {
  const ms = ~~timeout;
  let buffered = [];

  return new River((resolve, reject, write, free) => {
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

    const cancelRiver = this.pump((item) => {
      if (buffered.push(item) === max) {
        flush();
      } else if (timeout !== null && buffered.length === 1) {
        timer = setTimeout(flush, ms);
      }
    });

    this.then(() => {
      if (buffered.length !== 0) flush();
      resolve();
    }, (err) => {
      reset();
      reject(err);
    });

    free(cancelRiver);
  });
};

module.exports = River;
