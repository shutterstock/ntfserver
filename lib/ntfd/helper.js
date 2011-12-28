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

  var testOptions = {
    testStart: function(name) {
      lastResult = results[name] = { assertions: [], ok: true }
    },
    log: function(a) {
      lastResult.assertions.push({
        method: a.method,
        message: a.message,
        ok: !a.failed(),
      })
      if (a.failed()) lastResult.ok = false
    },
    testDone: function(name, test) {
      lastResult.duration = test.duration
    },
  }

  var runTest = function() {

    nodeunit.runModule(name, test, testOptions, function(err, suite) {
      var data = {
        name: name,
        duration: suite.duration,
        failures: suite.failures(),
        passes: suite.passes(),
        results: results,
      }
      global.events.emit('test', data)
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
