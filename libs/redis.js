'use strict';

var Promise = require('bluebird');
var Redis = require('redis');
var _ = require('underscore');
var shortid = require('shortid');

// will hold the client connection
function connError() {
  throw new Error('Redis connection not initialized.');
}

var redis = {

  /**
   * Enstablish a connections to Redis.
   * It's just a wrapper method to create a global connection. It accepts all
   * the `Redis.createClient()` arguments.
   *
   * @see https://github.com/mranney/node_redis#rediscreateclient
   */
  connect() {
    if (redis.client) { throw new Error('Connection already enstablished'); }

    redis.client = Redis.createClient.apply(this, arguments);

    // wrap client connections events into a promise
    return new Promise(function(resolve, reject) {

      redis.client.on('connect', resolve);
      redis.client.on('error', reject);
    });
  },

  /**
   * Safely close Redis client connection
   */
  quit(done) {
    if (redis.client) { redis.client.quit(done); }
  },

  /**
   * Original Redis client for whoever knows the reason it might be useful
   */
  client: undefined,

  /**
   * Promisify redis GET function, adding the option to JSON-decode the result.
   *
   * @param {String}  key    - key to pass to the GET request
   * @param {Boolean} [json] - decode as json if set to true
   * @return {Promise.<Object|String>} A promise to the data
   */
  get(key, json) {
    if (!redis.client) { return connError(); }

    return new Promise(function(fulfill, reject) {

      redis.client.get(key, function(err, data) {
        /* istanbul ignore next */
        if (err) { return reject(err); }

        if (!data) { return fulfill(null); }

        if (json) { data = JSON.parse(data); }
        return fulfill(data);
      });
    });
  },

  /**
   * Set using a promise a value to redis. Automatically generates a UID to
   * use as key (if not passed).
   *
   * @param {mixed}   value            - value to store
   * @param {Object}  [options]        - additional options
   * @param {String}  [options.key]    - use a user defined key, defaults to a generated short id
   * @param {String}  [options.prefix] - prefix to use on the key
   * @param {Boolean} [options.json]   - mark the passed content as to be stringified
   * @param {Number}  [options.expire] - set a TTL in seconds
   * @return {Promise.<String>} A promise to the key used when setting the data
   */
  set(value, options) {
    options = _.defaults(options || {}, {
      key: shortid.generate(),
      prefix: '',
      json: typeof value === 'object'
    });

    return new Promise(function(fulfill, reject) {
      let sequence = redis.client.multi();
      let key = options.prefix + options.key;

      if (options.json) {
        value = JSON.stringify(value);
      }

      sequence.set(key, value);

      if (options.expire) {
        sequence.expire(key, options.expire);
      }

      return sequence.exec(function(err) {
        /* istanbul ignore next */
        if (err) { return reject(err); }

        return fulfill(key);
      });
    });
  }

}

/**
 * Globally avaliable Redis connection closing method
 */
global.redisCloseConn = redis.quit;

/** Export redis */
module.exports = redis;
