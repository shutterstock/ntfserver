var async = require('async')
  , global = require('../lib/ntfserver/global')
  , helper = require('./assets/helper')
  , models = require('../lib/ntfserver/models')

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

exports.testGetOrInsert = function(test) {
  async.waterfall([
    // setup
    function(cb) { helper.setUpFixtures({ suite: 1 }, cb) },
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
      helper.setUpFixtures({ agent: 1, test: 1 }, cb)
    },
    // insert
    function(context, cb) {
      context.name = 'test'
      context.duration = 123
      context.passes = 8
      context.failures = 2
      context.time = 1327555445
      models.TestResult.getOrInsert(context, function(err, id) {
        if (err) return cb(err)
        test.equal(id, 1)
        cb(null, context)
      })
    },
    // get from cache
    function(context, cb) {
      models.Test.cache[context.suite_id + '|' + context.name] = 2
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
