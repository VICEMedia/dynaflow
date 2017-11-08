// 'use strict';
// const { expect } = require('chai');
// const Dynaflow = require('../');
// const Promise = require('wise-promise');
// const { dynamoConfig } = require('./helpers');

// describe('wrapped.js', function () {
//   const dynaflow = new Dynaflow(dynamoConfig);

//   const wrappedMethods = [
//     'createTable',
//     'updateTable',
//     'deleteTable',
//     'getItem',
//     'putItem',
//     'updateItem',
//     'deleteItem',
//     'describeTable',
//     'describeLimits',
//     'describeTimeToLive',
//     'tagResource',
//     'untagResource',
//     'waitFor',
//     'updateTimeToLive',
//   ];

//   it('promisifies dynamo methods', function () {
//     wrappedMethods.forEach((method) => {
//       expect(dynaflow[method]().catch(() => {})).to.be.an.instanceOf(Promise);
//     });
//   });
// });
