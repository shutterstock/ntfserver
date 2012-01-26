var async = require('async')
  , helper = require('./assets/helper')
  , models = require('../lib/ntfserver/models')

exports.setUp = helper.setUpSql
exports.tearDown = helper.tearDownSql

exports.agentGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Agent.getOrInsert({ name: 'agent' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Agent.cache.agent.id = 2
      models.Agent.getOrInsert({ name: 'agent' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Agent.cache = {}
      models.Agent.getOrInsert({ name: 'agent' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
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
      models.Suite.getOrInsert({ name: 'suite' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Suite.cache.suite.id = 2
      models.Suite.getOrInsert({ name: 'suite' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Suite.cache = {}
      models.Suite.getOrInsert({ name: 'suite' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}

exports.testGetOrInsert = function(test) {
  async.series([
    // insert
    function(cb) {
      models.Test.getOrInsert({ suite: 'suite', name: 'test' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
        cb()
      })
    },
    // get from cache
    function(cb) {
      models.Test.cache['suite|test'].id = 2
      models.Test.getOrInsert({ suite: 'suite', name: 'test' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 2)
        cb()
      })
    },
    // get from database
    function(cb) {
      models.Test.cache = {}
      models.Test.getOrInsert({ suite: 'suite', name: 'test' }, function(err, obj) {
        if (err) throw err
        test.equal(obj.id, 1)
        cb()
      })
    },
  ], function(err, result) {
    test.done()
  })
}
