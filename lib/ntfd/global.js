var redisLib = require('redis')

exports.SEP = '\x01'

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
