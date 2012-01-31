var async = require('async')
  , global = require('./global')
  , models = require('./models')
  , util = require('util')

var handleAssertion = exports.handleAssertion = function(test_result_id, assertion, cb) {
  work = []

  // assertion
  work.push(function(cb) {
    models.Assertion.getOrInsert({ name: assertion.message }, cb)
  })

  // assertion result
  work.push(function(assertion_id, cb) {
    models.AssertionResult.getOrInsert({
      test_result_id: test_result_id,
      assertion_id: assertion_id,
      ok: assertion.ok,
    }, cb)
  })

  async.waterfall(work, cb)
}

var handleTest = exports.handleTest = function(context, name, test, cb) {
  work = []

  // test
  work.push(function(cb) {
    models.Test.getOrInsert({ suite_id: context.suite_id, name: name }, cb)
  })

  // test result
  work.push(function(test_id, cb) {
    var pass_count = 0
      , fail_count = 0

    for (var i in test.assertions) {
      var assertion = test.assertions[i]
      if (assertion.ok) {
        pass_count++
      } else {
        fail_count++
      }
    }

    models.TestResult.getOrInsert({
      suite_result_id: context.suite_result_id,
      test_id: test_id,
      duration: test.duration,
      pass_count: pass_count,
      fail_count: fail_count,
    }, cb)
  })

  // assertions
  work.push(function(test_result_id, cb) {
    var assertionWork = []

    test.assertions.forEach(function(assertion) {
      assertionWork.push(function(cb) {
        handleAssertion(test_result_id, assertion, cb)
      })
    })

    async.parallel(assertionWork, cb)
  })

  async.waterfall(work, cb)
}

var handleSuite = exports.handleSuite = function(suite, cb) {
  async.auto({
    // agent
    agent_id: function(cb) {
      models.Agent.getOrInsert({ name: suite.agent }, cb)
    },
    // suite
    suite_id: function(cb) {
      models.Suite.getOrInsert({ name: suite.name }, cb)
    },
    // suite result
    suite_result_id: ['agent_id', 'suite_id', function(cb, context) {
      models.SuiteResult.getOrInsert({
        suite_id: context.suite_id,
        agent_id: context.agent_id,
        duration: suite.duration,
        pass_count: suite.passes,
        fail_count: suite.failures,
        time: suite.time,
      }, cb)
    }],
    // test results
    test_results: ['suite_id', 'suite_result_id', function(cb, context) {
      var work = []
      for (var name in suite.results) {
        (function(context, name, test) {
          work.push(function(cb) {
            handleTest(context, name, test, cb)
          })
        })(context, name, suite.results[name])
      }
      async.parallel(work, cb)
    }],
  }, function(err) {
    if (cb) return cb(err)
    if (err) util.log(err)
  })
}
