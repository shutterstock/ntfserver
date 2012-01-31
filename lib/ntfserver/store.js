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

var handleMeta = exports.handleMeta = function(test_result_id, meta, cb) {
  work = []

  // assertion
  work.push(function(cb) {
    models.Meta.getOrInsert({ name: meta.name, value: meta.value }, cb)
  })

  // assertion result
  work.push(function(meta_id, cb) {
    models.MetaResult.getOrInsert({
      test_result_id: test_result_id,
      meta_id: meta_id,
    }, cb)
  })

  async.waterfall(work, cb)
}

var handleTest = exports.handleTest = function(context, test, cb) {
  work = []

  // test
  work.push(function(cb) {
    models.Test.getOrInsert({ suite_id: context.suite_id, name: test.name }, cb)
  })

  // test result
  work.push(function(test_id, cb) {
    models.TestResult.getOrInsert({
      suite_result_id: context.suite_result_id,
      test_id: test_id,
      duration: test.duration,
      passes: test.passes,
      failures: test.failures,
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

    async.parallel(assertionWork, function(err) {
      cb(err, test_result_id)
    })
  })

  // meta
  work.push(function(test_result_id, cb) {
    var metaWork = []

    for (var name in test.meta) {
      (function(name, value) {
        metaWork.push(function(cb) {
          handleMeta(test_result_id, { name: name, value: value }, cb)
        })
      })(name, test.meta[name])
    }

    async.parallel(metaWork, cb)
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
        passes: suite.passes,
        failures: suite.failures,
        time: suite.time,
      }, cb)
    }],
    // test results
    test_results: ['suite_id', 'suite_result_id', function(cb, context) {
      var work = []
      for (var name in suite.tests) {
        (function(context, name, test) {
          test.name = name
          work.push(function(cb) {
            handleTest(context, test, cb)
          })
        })(context, name, suite.tests[name])
      }
      async.parallel(work, cb)
    }],
  }, function(err) {
    if (cb) return cb(err)
    if (err) util.log(err)
  })
}
