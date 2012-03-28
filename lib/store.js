var async = require('async')
  , util = require('util')
  , models = require('./models')
  , shared = require('./shared')

var handleAssertion = exports.handleAssertion = function(test_result_id, assertion, cb) {
  work = []

  // assertion and stack trace
  work.push(function(cb) {
    var work = {}

    work.assertion_id = function(cb) {
      models.Assertion.getOrInsert({ message: assertion.message }, cb)
    }

    work.stack_trace_id = function(cb) {
      models.StackTrace.getOrInsert({ value: assertion.stack_trace || '' }, cb)
    }

    async.parallel(work, cb)
  })

  // assertion result
  work.push(function(context, cb) {
    models.AssertionResult.getOrInsert({
      test_result_id: test_result_id,
      assertion_id: context.assertion_id,
      stack_trace_id: context.stack_trace_id,
      ok: assertion.ok,
      stack: (assertion.stack ? assertion.stack : '')
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
      meta_id: meta_id
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
      pass: test.pass,
      fail: test.fail
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
    Object.keys(test.meta).forEach(function(name) {
      var value = test.meta[name]
      metaWork.push(function(cb) {
        handleMeta(test_result_id, { name: name, value: value }, cb)
      })
    })
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
        pass: suite.pass,
        fail: suite.fail,
        time: suite.time
      }, cb)
    }],
    // test results
    test_results: ['suite_id', 'suite_result_id', function(cb, context) {
      var work = []
      Object.keys(suite.tests).forEach(function(name) {
        var test = suite.tests[name]
        test.name = name
        work.push(function(cb) {
          handleTest(context, test, cb)
        })
      })
      async.parallel(work, function(err) {
        shared.events.emit('suite.result', context.suite_result_id)
        cb(err)
      })
    }]
  }, function(err) {
    if (cb) return cb(err)
    if (err) util.log(err)
  })
}
