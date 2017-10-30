'use strict';

const { DynamoDB } = require('aws-sdk');
const Promise = require('wise-promise');
const River = require('./river');

const scanPromise = Promise.promisify(DynamoDB.prototype.scan);
const queryPromise = Promise.promisify(DynamoDB.prototype.scan);

/**
 * Recursively scan or query the dynamo database, paginating over all results until
 * we reach the end of the result set. Returns a promise that resolves when
 * all results have been read.
 * @param {scan|query} op - The database operation to execute. Should be a promisified version of
 *    scan or query.
 * @param {Object} params - The options for the scan or query
 * @param {fn(data)} callback - A function to be called with each page of data as it is returned
 *    from dynamo.
 */
function iterateDynamo(op, params, callback = () => {}, ExclusiveStartKey) {
  params = Object.assign({}, params, { ExclusiveStartKey });
  return op(params)
    .then((data) => {
      callback(data);
      if (data.LastEvaluatedKey) return iterateDynamo(op, params, callback, data.LastEvaluatedKey);
      return undefined;
    });
}

/**
 * Performs a scan or query over a dynamo database outputting outputting all results over a
 * wise-river. Resolves when all results have been written out.
 * @param {scan|query} op - The database operation to execute. Should be a promisified version of
 *    scan or query.
 * @param {Object} params - The options for the scan or query.
 */
function riverDynamo(op, params) {
  return new River((resolve, reject, write) => {
    iterateDynamo(op, params, (data) => {
      data.Items.forEach(write);
    })
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Returns a promise that resolves with a count of the results from a scan or query.
 * @param {scan|query} op - The database operation to execute. Should be a promisified version of
 *    scan or query.
 * @param {Object} params - The options for the scan or query.
 */
function countDynamo(op, params) {
  let count = 0;
  params = Object.assign({}, params, { Select: 'COUNT' });
  return iterateDynamo(op, params, (data) => {
    count += data.Count;
  })
    .catch()
    .then(() => count);
}

/**
 * Returns a promise that resolves with a count of the results for a scan
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {Object} params - The options for the scan.
 */
module.exports.countScan = (db, params) => countDynamo(scanPromise.bind(db), params);

/**
 * Returns a promise that resolves with a count of the results for a query
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {Object} params - The options for the query.
 */
module.exports.countQuery = (db, params) => countDynamo(queryPromise.bind(db), params);

/**
 * Returns a wise-river that emits the results for a scan
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {Object} params - The options for the scan.
 */
module.exports.riverScan = (db, params) => riverDynamo(scanPromise.bind(db), params);

/**
 * Returns a wise-river that emits the results for a query
 * @param {DynamoDB} db - An instance of the DynamoDB interface object.
 * @param {Object} params - The options for the query.
 */
module.exports.riverQuery = (db, params) => riverDynamo(queryPromise.bind(db), params);
