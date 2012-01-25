var async = require('async')
  , events = require('events')
  , mysql = require('mysql')
  , util = require('util')

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

var setupSql = function(options) {
  var sql = exports.sql

  async.series([
    function(cb) { sql.query('USE ' + options.mysql.database, cb) },
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS agent (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `name`                 varchar(255) NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    UNIQUE KEY (`name`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
	},
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS suite (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `name`                 varchar(255) NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    UNIQUE KEY (`name`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
	},
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS test (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `suite_id`             int unsigned NOT NULL,' +
      '    `name`                 varchar(255) NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    UNIQUE KEY (`suite_id`, `name`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
    },
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS test_result (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `agent_id`             int unsigned NOT NULL,' +
      '    `test_id`              int unsigned NOT NULL,' +
      '    `duration`             int unsigned NOT NULL,' +
      '    `passes`               int unsigned NOT NULL,' +
      '    `failures`             int unsigned NOT NULL,' +
      '    `time`                 int unsigned NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    KEY (`agent_id`),' +
      '    KEY (`test_id`),' +
      '    KEY (`time`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
    },
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS assertion (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `message`              char(255) NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    UNIQUE KEY (`message`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
    },
    function(cb) { sql.query(
      'CREATE TABLE IF NOT EXISTS assertion_result (' +
      '    `id`                   int unsigned auto_increment NOT NULL,' +
      '    `test_result_id`       int unsigned NOT NULL,' +
      '    `assertion_id`         int unsigned NOT NULL,' +
      '    `ok`                   tinyint unsigned NOT NULL,' +
      '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
      '    PRIMARY KEY (`id`),' +
      '    KEY (`create_time`)' +
      ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
    }], function(err) {
	  if (!err) return
	  util.log(err)
	  process.exit(1)
	})
}

exports.events = new Events()
exports.io = null
exports.options = null
exports.sql = null

exports.setup = function(options, cb) {
  exports.options = options
  exports.sql = mysql.createClient(options.mysql)
  setupSql(options, cb)
}
