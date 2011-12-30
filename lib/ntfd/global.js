var events = require('events')
  , util = require('util')
  , redisLib = require('redis')

exports.SEP = '\x01'
exports.io = null
exports.redis = null

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

exports.events = new Events()

exports.setup = function(suite, options) {
  exports.options = options
  exports.suite = suite

  var redis = exports.redis = redisLib.createClient(options.redis.port, options.redis.host)

  redis.select(options.redis.database)

  redis.on('connect', function() {
    redis.send_anyways = true
    redis.select(options.redis.database)
    redis.send_anyways = false
  })

  redis.on('error', function(err) {
    console.log('' + err)
  })
}
