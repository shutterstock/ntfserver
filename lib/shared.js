var async = require('async')
  , events = require('events')
  , fs = require('fs')
  , mysql = require('mysql')
  , path = require('path')
  , util = require('util')

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

exports.setupSql = function(options, cb) {
  var sql = exports.sql
    , models = require('./models')

  async.series([
    function(cb) { sql.query('USE ' + options.mysql.database, cb) },
    models.Agent.setup,
    models.Suite.setup,
    models.SuiteResult.setup,
    models.Test.setup,
    models.TestResult.setup,
    models.StackTrace.setup,
    models.Assertion.setup,
    models.AssertionResult.setup,
    models.Meta.setup,
    models.MetaResult.setup
    ], function(err) {
      if (err) {
        if (cb) return cb(err)
        util.log(err)
        process.exit(1)
      } else {
        if (cb) return cb()
      }
  })
}

exports.setupEvents = function(options, cb) {
  var api = require('./api')
    , e = exports.events

  e.on('store', require('./store').handleSuite)

  e.on('suite.result', function(id) {
    if (!exports.io) return

    api.getSuiteResultList({ suite_result_id: id }, function(err, suiteResultList) {
      if (err || !suiteResultList.length) return
      exports.io.of('/events').emit('suite', suiteResultList[0])
    })
  })

  if (cb) cb()
}

exports.events = new Events()
exports.io = null
exports.options = null
exports['package'] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')))
exports.sql = null

exports.setup = function(options) {
  exports.options = options
  exports.sql = mysql.createClient(options.mysql)
  exports.setupSql(options)
  exports.setupEvents(options)
}
