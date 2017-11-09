'use strict';
const chai = require('chai');
const { clearDatabase } = require('./helpers');

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

beforeEach(() => {
  return clearDatabase();
});

afterEach(() => {
  return clearDatabase();
});
