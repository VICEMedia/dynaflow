'use strict';
const { expect } = require('chai');
const Promise = require('wise-promise');
const { dynaflow, createTestingTable, range } = require('./helpers');

describe('paginated', function () {
  describe('listTables', function () {
    beforeEach(function () {
      return Promise.all(range(50).map(i => (
        createTestingTable({ TableName: `table${i}` })
      )));
    });

    it('lists all tables using pagination', function () {
      return dynaflow.listTables({ itemsOnly: false }).all().then((res) => {
        // Paginated results
        expect(res).to.have.lengthOf(1);
        const info = res[0];
        expect(info).to.have.all.keys('TableNames');
        expect(info.TableNames).to.have.lengthOf(50);
        range(50).forEach((i) => {
          // Order isn't preserved so we need to do it like this
          expect(info.TableNames).to.include(`table${i}`);
        });
      });
    });

    it('lists all tables as items only', function () {
      dynaflow.listTables({ itemsOnly: true }).all().then((res) => {
        // Item only results
        expect(res).to.have.lengthOf(50);
        range(50).forEach((i) => {
          // Order isn't preserved so we need to do it like this
          expect(res).to.include(`table${i}`);
        });
      });
    });
  });

  describe('scan', function () {
    beforeEach(function () {
      return createTestingTable({ TableName: 'testing' })
        .then(() => Promise.all(range(40).map(i => (
          dynaflow.putItem({
            TableName: 'testing',
            Item: {
              id: { S: `${i}` },
              timestamp: { N: `${i}` },
              data: { S: 'a'.repeat(100000) },
            },
          })
        ))));
    });

    it('scans a table over multiple calls using pagination', function () {
      return dynaflow.scan({ TableName: 'testing', itemsOnly: false }).all().then((res) => {
        let count = 0;
        expect(res).to.have.length.greaterThan(1);
        res.forEach((page) => {
          expect(page).to.have.any.keys('Items', 'Count');
          page.Items.forEach((element) => {
            expect(element.id.S).to.exist;
            expect(element.timestamp.N).to.exist;
            expect(element.data.S).to.exist;
          });
          count += page.Count;
        });
        expect(count).to.equal(40);
      });
    });

    it('scans a table over multiple calls using items only', function () {
      return dynaflow.scan({ TableName: 'testing', itemsOnly: true }).all().then((res) => {
        expect(res).to.have.lengthOf(40);
        res.forEach((element) => {
          expect(element.id.S).to.exist;
          expect(element.timestamp.N).to.exist;
          expect(element.data.S).to.exist;
        });
      });
    });
  });

  describe('query', function () {
    beforeEach(function () {
      return createTestingTable({ TableName: 'testing' })
        .then(() => Promise.all(range(60).map(i => (
          dynaflow.putItem({
            TableName: 'testing',
            Item: {
              id: { S: `${i % 2}` },
              timestamp: { N: `${i}` },
              data: { S: 'a'.repeat(100000) },
            },
          })
        ))));
    });

    it('queries over multiple calls using pagination', function () {
      return dynaflow.query({
        TableName: 'testing',
        KeyConditionExpression: 'id = :val',
        ExpressionAttributeValues: { ':val': { S: '0' } },
        itemsOnly: false,
      }).all().then((res) => {
        let count = 0;
        expect(res).to.have.length.greaterThan(1);
        res.forEach((page) => {
          expect(page).to.have.any.keys('Items', 'Count');
          page.Items.forEach((element) => {
            expect(element.id).to.deep.equal({ S: '0' });
            expect(element.timestamp.N).to.exist;
            expect(element.data.S).to.exist;
          });
          count += page.Count;
        });
        expect(count).to.equal(30);
      });
    });

    it('queries over multiple calls using items only', function () {
      return dynaflow.query({
        TableName: 'testing',
        KeyConditionExpression: 'id = :val',
        ExpressionAttributeValues: { ':val': { S: '0' } },
        itemsOnly: true,
      }).all().then((res) => {
        expect(res).to.have.lengthOf(30);
        res.forEach((element) => {
          expect(element.id).to.deep.equal({ S: '0' });
          expect(element.timestamp.N).to.exist;
          expect(element.data.S).to.exist;
        });
      });
    });
  });
});
