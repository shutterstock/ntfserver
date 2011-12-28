var global = require('./global')
  , helper = require('./helper')

var loop = function(fn, options) {
  options = options || {}

  options.timeout = options.timeout != undefined ? options.timeout :
    (global.config.test.timeout * 1000)

  // don't loop if <= zero
  if (!options.timeout || options.timeout < 0) return

  var timeout = options.timeout

  // add some randomness to the first run
  if (options.random) {
    timeout = Math.floor(Math.random() * timeout)
    delete options.random
  }

  setTimeout(function() {
    fn(function(err) {
      loop(fn, options)
    })
  }, timeout)
}

exports.run = function(config) {
  var suites = global.config.test.module

  for (var name in suites) {
    (function(name, suite) {
      loop(function(cb) {
        var time = parseInt(new Date().getTime() / 1000)

        helper.runTest(name, suite, function(err, data) {
          global.redis.zadd(
            'test/' + name,
            time,
            time + global.SEP + JSON.stringify(data)
          )
          cb()
        })
      }, { random: true })
    })(name, suites[name])
  }
}
