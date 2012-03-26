var async = require('async')
  , shared = require('../../lib/shared')
  , models = require('../../lib/models')
  , mysql = require('mysql')

exports.setUpSql = function(cb) {
  models.clearCache()

  shared.options = {
    mysql: {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'ntf_test',
    }
  }
  shared.sql = mysql.createClient(shared.options.mysql)

  var tables = [
    'assertion_result',
    'assertion',
    'meta_result',
    'meta',
    'test_result',
    'test',
    'suite_result',
    'suite',
    'agent',
  ]

  work = []

  work.push(function(cb) {
    shared.sql.query('DROP TABLE IF EXISTS ' + tables.join(','), cb)
  })

  work.push(function(cb) {
    shared.setupSql(shared.options, cb)
  })

  async.series(work, function(err) {
    if (err) throw err
    cb()
  })
}

exports.tearDownSql = function(cb) {
  try { shared.sql.destroy() } catch(err) {}
  shared.sql = null
  cb()
}

exports.setUpFixtures = function(setup, cb) {
  var work = [
    function(cb) { cb(null, {}) }
  ]

  if (setup.assertion_result) setup.assertion = true
  if (setup.assertion_result) setup.test_result = true
  if (setup.test) setup.suite = true
  if (setup.test_result) setup.suite_result = true
  if (setup.test_result) setup.test = true
  if (setup.suite_result) setup.agent = true
  if (setup.suite_result) setup.suite = true

  if (setup.agent) {
    work.push(function(context, cb) {
      models.Agent.getOrInsert({ name: 'agent' }, function(err, id) {
        context.agent_id = id
        cb(err, context)
      })
    })
  }

  if (setup.suite) {
    work.push(function(context, cb) {
      models.Suite.getOrInsert({ name: 'suite' }, function(err, id) {
        context.suite_id = id
        cb(err, context)
      })
    })
  }

  if (setup.suite_result) {
    work.push(function(context, cb) {
      context.duration = 123
      context.pass = 8
      context.fail = 2
      context.time = 123456789
      models.SuiteResult.getOrInsert(context, function(err, id) {
        context.suite_result_id = id
        delete context.duration
        delete context.pass
        delete context.fail
        delete context.time
        cb(err, context)
      })
    })
  }

  if (setup.test) {
    work.push(function(context, cb) {
      context.name = 'test'
      models.Test.getOrInsert(context, function(err, id) {
        context.test_id = id
        delete context.name
        cb(err, context)
      })
    })
  }

  if (setup.test_result) {
    work.push(function(context, cb) {
      context.duration = 123
      context.pass = 3
      context.fail = 1
      models.TestResult.getOrInsert(context, function(err, id) {
        context.test_result_id = id
        delete context.duration
        delete context.pass
        delete context.fail
        cb(err, context)
      })
    })
  }

  if (setup.meta) {
    work.push(function(context, cb) {
      models.Meta.getOrInsert({ name: 'meta', value: 'value' }, function(err, id) {
        context.meta_id = id
        cb(err, context)
      })
    })
  }

  if (setup.assertion) {
    work.push(function(context, cb) {
      models.Assertion.getOrInsert({ name: 'assertion' }, function(err, id) {
        context.assertion_id = id
        cb(err, context)
      })
    })
  }

  if (setup.assertion_result) {
    work.push(function(context, cb) {
      context.ok = true
      context.stack = ''
      models.AssertionResult.getOrInsert(context, function(err, id) {
        context.assertion_result_id = id
        delete context.ok
        delete context.stack
        cb(err, context)
      })
    })
  }

  async.waterfall(work, cb)
}
