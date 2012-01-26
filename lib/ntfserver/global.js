var async = require('async')
  , events = require('events')
  , mysql = require('mysql')
  , models = require('./models')
  , util = require('util')

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

exports.setupSql = function(options, cb) {
  var sql = exports.sql

  async.series([
    function(cb) { sql.query('USE ' + options.mysql.database, cb) },
    models.Agent.setup,
    models.Suite.setup,
    models.Test.setup,
    models.TestResult.setup,
    models.Assertion.setup,
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS assertion_result (' +
      '    `assertion_result_id`  int unsigned auto_increment NOT NULL,' +
      '    `test_result_id`       int unsigned NOT NULL,' +
      '    `assertion_id`         int unsigned NOT NULL,' +
      '    `ok`                   tinyint unsigned NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`assertion_result_id`),' +
      '    KEY (`test_result_id`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
    }], function(err) {
      if (err) {
        if (cb) return cb(err)
        util.log(err)
        process.exit(1)
      } else {
        if (cb) return cb()
      }
  })
}

exports.events = new Events()
exports.io = null
exports.options = null
exports.sql = null

exports.setup = function(options) {
  exports.options = options
  exports.sql = mysql.createClient(options.mysql)
  exports.setupSql(options)
}
