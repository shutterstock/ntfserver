var async = require('async')
  , helper = require('./assets/helper')
  , models = require('../lib/models')

exports.setUp = helper.setUpSql
exports.tearDown = helper.tearDownSql

exports.agentGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Agent.getOrInsert({ name: 'agent' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Agent.cache.agent = 2
      models.Agent.getOrInsert({ name: 'agent' }, function(err, id) {
        if (err) throw err
        test.equal(id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Agent.cache = {}
      models.Agent.getOrInsert({ name: 'agent' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.suiteGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Suite.getOrInsert({ name: 'suite' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Suite.cache.suite = 2
      models.Suite.getOrInsert({ name: 'suite' }, function(err, id) {
        if (err) throw err
        test.equal(id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Suite.cache = {}
      models.Suite.getOrInsert({ name: 'suite' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.suiteResultGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) {
      helper.setUpFixtures({ agent: true, suite: true }, cb)
    },
    // insert
    function(context, cb) {
      context.duration = 123
      context.pass = 8
      context.fail = 2
      context.time = 123456789
      models.SuiteResult.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
  ], function(err) {
    if (err) throw err
    test.done()
  })
}

exports.testGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) { helper.setUpFixtures({ suite: true }, cb) },
    // insert
    function(context, cb) {
      context.name = 'test'
      models.Test.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
    // get from cache
    function(context, cb) {
      models.Test.cache[context.suite_id + '|test'] = 2
      models.Test.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 2)
        cb(null, context)
      })
    },
    // get from database
    function(context, cb) {
      models.Test.cache = {}
      models.Test.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err) {
    if (err) throw err
    test.done()
  })
}

exports.testResultGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) {
      helper.setUpFixtures({ suite_result: true, test: true }, cb)
    },
    // insert
    function(context, cb) {
      context.duration = 123
      context.pass = 3
      context.fail = 1
      models.TestResult.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
  ], function(err) {
    if (err) throw err
    test.done()
  })
}

exports.metaGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Meta.getOrInsert({ name: 'meta', value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Meta.cache['meta|value'] = 2
      models.Meta.getOrInsert({ name: 'meta', value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Meta.cache = {}
      models.Meta.getOrInsert({ name: 'meta', value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.metaResultGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) {
      helper.setUpFixtures({ meta: true, test_result: true }, cb)
    },
    // insert
    function(context, cb) {
      context.ok = true
      models.MetaResult.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
  ], function(err) {
    if (err) throw err
    test.done()
  })
}

exports.stackTraceGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.StackTrace.getOrInsert({ value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.StackTrace.cache['value'] = 2
      models.StackTrace.getOrInsert({ value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.StackTrace.cache = {}
      models.StackTrace.getOrInsert({ value: 'value' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.assertionGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Assertion.getOrInsert({ message: 'assertion' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Assertion.cache.assertion = 2
      models.Assertion.getOrInsert({ message: 'assertion' }, function(err, id) {
        if (err) throw err
        test.equal(id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Assertion.cache = {}
      models.Assertion.getOrInsert({ message: 'assertion' }, function(err, id) {
        if (err) throw err
        test.equal(id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.assertionResultGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) {
      helper.setUpFixtures({ assertion: true, stack_trace: true, test_result: true }, cb)
    },
    // insert
    function(context, cb) {
      context.ok = true
      models.AssertionResult.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
  ], function(err) {
    if (err) throw err
    test.done()
  })
}
