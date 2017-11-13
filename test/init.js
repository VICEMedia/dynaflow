'use strict';
const chai = require('chai');
const { clearDatabase } = require('./helpers');

process.on('unhandledRejection', (err) => {
  throw err;
});

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

beforeEach(() => {
  return clearDatabase();
});

after(() => {
  return clearDatabase();
});
