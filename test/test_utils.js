'use strict';
const { expect } = require('chai');
const sinon = require('sinon');
const utils = require('../lib/utils');

describe('utils', function () {
  describe('keys', function () {
    it('runs function for every key in an object', function () {
      const spy = sinon.spy();
      utils.keys({
        a: null,
        b: null,
        c: null,
      }, spy);
      expect(spy).to.have.been.calledThrice;
      expect(spy).to.have.been.calledWith('a');
      expect(spy).to.have.been.calledWith('b');
      expect(spy).to.have.been.calledWith('c');
    });

    it('does nothing if the object is null', function () {
      const spy = sinon.spy();
      utils.keys(null, spy);
      expect(spy).to.have.not.been.called;
    });
  });

  describe('omit', function () {
    it('removes a key from an object', function () {
      expect(utils.omit({
        a: null,
        b: null,
        c: null,
      }, 'b')).to.have.all.keys('a', 'c').and.not.have.any.keys('b');
    });
  });

  describe('option', function () {
    it('returns the specified key if it exists', function () {
      expect(utils.option({ a: true }, 'a')).to.be.true;
    });

    it('returns null if the object is null', function () {
      expect(utils.option(null, 'a')).to.be.null;
    });
  });
});
