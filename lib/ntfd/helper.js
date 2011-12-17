var async = require('async')
  , nodeunit = require('nodeunit')
  , global = require('./global')

var parseRedis = exports.parseRedis = function(data) {
  data = data.split(global.SEP)
  var doc = JSON.parse(data[1])
  doc.timestamp = parseInt(data[0])
  return doc
}

exports.runTest = function(/* name, test, [options], callback */) {
  var results = {}
    , name = arguments[0]
    , test = arguments[1]
    , lastResult = null
    , callback = null
    , options = {}
    , testOptions = {}

  if (arguments.length == 4) {
    options = arguments[2]
    callback = arguments[3]
  } else {
    callback = arguments[2]
  }

  var runTest = function() {
    if (options.full) {
      testOptions = {
        testStart: function(name) {
          lastResult = results[name] = []
          lastResult.failed = 0
        },
        log: function(a) {
          lastResult.push({
            method: a.method,
            message: a.message,
            failed: a.failed(),
          })
          if (a.failed()) lastResult.failed = 1
        },
      }
    }

    nodeunit.runModule(name, test, testOptions, function(err, assertions) {
      var data = {
        name: name,
        duration: assertions.duration,
        failures: assertions.failures(),
        passes: assertions.passes(),
      }
      if (options.full) data.results = results
      callback(null, data)
    })
  }

  if (options.maxAge && options.maxAge > 0) {
    var time = parseInt(new Date().getTime() / 1000)
    global.redis.zrangebyscore('test/' + name, time - options.maxAge, time, function(err, data) {
      if (err || !data || data.length <= 0) return runTest()
      var d = data[data.length-1]
      try {
        callback(null, parseRedis(data[data.length-1]))
      } catch(err) {
        runTest()
      }
    })
  } else {
    runTest()
  }
}

exports.runTests = function(/* tests, [options], callback */) {
  var work = {}
    , tests = arguments[0]
    , callback = null
    , options = {}

  if (arguments.length == 3) {
    options = arguments[1]
    callback = arguments[2]
  } else {
    callback = arguments[1]
  }

  for (var n in tests) {
    (function(name, test) {
      work[name] = function(cb) {
        exports.runTest(name, test, options, cb)
      }
    })(n, tests[n])
  }
  async.parallel(work, callback)
}
