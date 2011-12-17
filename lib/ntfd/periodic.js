var async = require('async')
  , global = require('./global')
  , helper = require('./helper')

var loop = function(fn, options) {
  options = options || {}

  options.timeout = options.timeout != undefined ? options.timeout :
    (global.config.test.timeout * 1000)

  // don't loop if <= zero
  if (!options.timeout || options.timeout < 0) return

  setTimeout(function() {
    fn(function(err) {
      loop(fn, options)
    })
  }, options.timeout)
}

exports.run = function(config) {
  var fn = function(cb) {
    var module = global.config.test.module
      , work = []

    var time = parseInt(new Date().getTime() / 1000)

    helper.runTests(module, { full: true }, function(err, suites) {
      for (var name in suites) {
        var suite = suites[name]
        global.redis.zadd('test/' + name, time, time + global.SEP + JSON.stringify(suites[name]))
      }

      cb()
    })
  }
  loop(fn)
}
