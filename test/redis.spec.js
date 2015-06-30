'use strict';

/** Test dependencies */
var Promise = require('bluebird');
var assert = require('assert');

/** Tested Libs */
var redis = require('../libs/redis');

function hasTTL(key) {
  return new Promise(function(fulfill, reject) {
    redis.client.TTL(key, function(err, ttl) {
      if (err) { return reject(err); }

      if (ttl < 0) {
        return reject(new Error('TTL is' + ttl));
      }

      return fulfill();
    })
  });
}

describe('libs/util/redis: Redis', function() {
  before(function(done) {
    redis.connect()
        .then(done)
        .catch(done);
  });

  after(function(done) {
    redis.quit(done);
  });

  describe('#get()', function() {
    before(function(done) {
      redis.client.multi()
          .set('test1', 'ok')
          .set('test2', JSON.stringify({test: 'ok'}))
          .exec(done);
    });

    it('should return a value', function() {
      return redis.get('test1')
          .then(function(val) {
            assert.equal(val, 'ok');
            return Promise.resolve();
          });
    });

    it('should return a JSON value', function() {
      return redis.get('test2', true)
          .then(function(res) {
            assert.equal(typeof res, 'object');
            assert.equal(res.test, 'ok');
            return Promise.resolve();
          });
    });

    it('should not fail when we attempt to get an empty value', function() {
      return redis.get(Date.now().toString())
          .then(function(res) {
            assert(!res);
            return Promise.resolve();
          });
    });

    it('should not fail when we attempt to get an empty value as JSON', function() {
      return redis.get(Date.now().toString(), true)
          .then(function(res) {
            assert(!res);
            return Promise.resolve();
          });
    });
  });

  describe('#set()', function() {

    it('should set a key without a tll and randome name when called with no options', function() {
      return redis.set('ciao')
          .then(function(key) {
            return hasTTL(key);
          })
          .then(function() { assert.fail('resolved', 'rejected', 'expected rejection', 'promise'); })
          .catch(function(err) {
            assert(/TTL/.test(err.toString()));
            return Promise.resolve();
          });
    });

    it('should store the value JSON-ifyed when an object is passed', function() {
      return redis.set({test: 'ok'})
          .then(function(key) {
            return redis.get(key, true);
          })
          .then(function(res) {
            assert.equal(typeof res, 'object');
            assert.equal(res.test, 'ok');
            return Promise.resolve();
          });
    });

    it('shold reject when no value is passed', function() {
      return redis.set()
          .catch(function() {
            return Promise.resolve();
          });
    });

    it('should prefix the key', function() {
      return redis.set('example', {prefix: 'test:'})
          .then(function(res) {
            assert(/test\:/g.test(res));
            return Promise.resolve();
          });
    });

    it('should use the provided key', function() {
      var key = 'testes' + Date.now().toString();
      return redis.set('example', {key: key})
          .then(function(res) {
            assert.deepEqual(res, key);
            return Promise.resolve();
          });
    });

    it('should set the TTL', function() {
      return redis.set('example', {expire: 1 * 60})
          .then(function(key) {
            return hasTTL(key);
          });
    })

  });

});
