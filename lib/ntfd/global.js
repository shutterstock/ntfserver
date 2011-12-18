var events = require('events')
  , util = require('util')
  , redisLib = require('redis')

exports.SEP = '\x01'
exports.io = null
exports.redis = null

function Notification() { events.EventEmitter.call(this) }
util.inherits(Notification, events.EventEmitter)

exports.notification = new Notification()

exports.setup = function(config) {
  exports.config = config

  var redis = exports.redis = redisLib.createClient(config.redis.port, config.redis.host)

  redis.select(config.redis.database)

  redis.on('connect', function() {
    redis.send_anyways = true
    redis.select(config.redis.database)
    redis.send_anyways = false
  })
}
