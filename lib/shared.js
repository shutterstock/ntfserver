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

exports.setupStore = function(options, cb) {
  exports.events.on('store', require('./store').handleSuite)
  if (cb) cb()
}

exports.setupIo = function(options, cb) {
  exports.io = require('socket.io')
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
  exports.setupStore(options)
  exports.setupIo(options)
}
