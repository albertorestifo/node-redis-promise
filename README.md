# node-redis-promise

[![Build Status](https://img.shields.io/travis/albertorestifo/node-redis-promise.svg?style=flat-square)](https://travis-ci.org/albertorestifo/node-redis-promise) [![Code Coverage](https://img.shields.io/codecov/c/github/codecov/albertorestifo/node-redis-promise.svg?style=flat-square)](https://codecov.io/github/albertorestifo/node-redis-promise) [![NPM](https://img.shields.io/npm/v/redis-promise.svg?style=flat-square)](https://www.npmjs.com/package/node-redis-promise)

> Helper methods for Redis and global connection handler

__Note:__ This module uses ES6 code and it's meant to be used with iojs in conjunction with the `--es_staging` flag.

## Install

```shell
npm install node-redis-promise --save
```

## Usage Example

First you need to create a global connection, for example in your `index.js`:

```js
var redis = require('node-redis-promise');

redis.connect();
```

And then in `foo.js`:

```js
var redis = require('node-redis-promise');

redis.set({foo: 'bar'}, {
      prefix: 'bar_',
      expire: 60 // TTL of 1 minute
    })
    .then(function(key) {
      console.log(key); // => bar_sjk21x

      return redis.get(key, true); // get key and JSON-decode the value
    })
    .then(function(bar) {
      console.log(bar); // => {foo: 'bar'}
    })
    .catch(function(err) {
      // always handle your errors!
    });
```

If you need to quit the global conneciton you can do so it two ways:

```js
var redis = require('node-redis-promise');
redis.quit();

// OR
global.redisCloseConn();
```

## API

### redis.connect()

Create a connection to Redis. Refer to the [Node Redis module documentation][redis-doc].

__Returns a Promise:__

  - Fulfilled: on succesfull connection
  - Rejected: when a connection error occours

Promise, fulfilled on a succesfull connection and reject on a connection error

### redis.get(key [, json])

Get the value of a key in Redis.

__Params:__

 - `key` (String): key to lookup
 - `json` (Boolean, optional): if set to `true`, JSON-decode the result

__Returns:__ Promise

### redis.set(value [, options])

Set a value in Redis, with some advanced options.

__Params:__

  - `value`: value to store
  - `options` (Object, optional): see below avaliable options

__Options:__

  - `key` (String): key to use when storing the value, defaults to a generated id using [`shortid`][shortid]
  - `prefix` (String): prefixes `keys` with the specified value
  - `json` (Boolean): JSON-encode the value before storing it. By default automatically attempts to detect Objects by using `typeof value === 'object'`
  - `expire` (Number): if sets, it will be used to set the TTL option on the value (seconds).

### redis.client

Native Redis client

### redis.quit

Safely closes the Redis conneciton

## Tests

```
npm test
```

## Contributing

Yes please. There is a `.jshintrc` and `.jscsrc` in this repo.

Use your favorite editor JsHint and JSCS plugins to lint the code, please.

## License

[The Unlicense](http://unlicense.org/)

[redis-doc]: https://github.com/mranney/node_redis#rediscreateclient
[shortid]: https://www.npmjs.com/package/shortid
