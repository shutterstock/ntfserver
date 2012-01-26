var async = require('async')
  , global = require('../../lib/ntfserver/global')
  , models = require('../../lib/ntfserver/models')
  , mysql = require('mysql')

exports.setUpSql = function(cb) {
  global.options = {
    mysql: {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'ntf_test',
    }
  }
  global.sql = mysql.createClient(global.options.mysql)

  var tables = ['agent', 'suite', 'test', 'test_result', 'assertion']

  async.series([
    function(cb) { global.sql.query('DROP TABLE IF EXISTS ' + tables.join(','), cb) },
    function(cb) { global.setupSql(global.options, cb) },
  ], function(err) {
    if (err) throw err
    cb()
  })
}

exports.tearDownSql = function(cb) {
  try { global.sql.destroy() } catch(err) {}
  global.sql = null
  cb()
}

var fixtureTypes = ['agent', 'suite', 'test']

var fixtureFunctions = {
}

exports.setUpFixtures = function(setup, cb) {
  var work = [
    function(cb) { cb(null, {}) }
  ]

  if (setup.agent) {
    work.push(function(context, cb) {
      context.name = context.agent_name = 'agent'
      models.Agent.getOrInsert(context, function(err, id) {
        context.agent_id = id
        cb(err, context)
      })
    })
  }

  if (setup.suite || setup.test) {
    work.push(function(context, cb) {
      context.name = context.suite_name = 'suite'
      models.Suite.getOrInsert(context, function(err, id) {
        context.suite_id = id
        cb(err, context)
      })
    })
  }

  if (setup.test) {
    work.push(function(context, cb) {
      context.name = context.test_name = 'test'
      models.Test.getOrInsert(context, function(err, id) {
        context.test_id = id
        cb(err, context)
      })
    })
  }

  async.waterfall(work, cb)
}
