var events = require('events')
  , mysql = require('mysql')
  , util = require('util')

exports.events = new Events()
exports.io = null
exports.options = null
exports.sql = null

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

var setupSql = function(options) {
  var log = function(err) { if (err) util.debug(err) }
    , sql = exports.sql

  sql.query('USE ' + options.mysql.database, log)

  sql.query(
    'CREATE TABLE IF NOT EXISTS agent (' +
    '    `id`                   int unsigned auto_increment NOT NULL,' +
    '    `name`                 varchar(255) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`id`),' +
    '    UNIQUE KEY (`name`),' +
    '    KEY (`name`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  sql.query(
    'CREATE TABLE IF NOT EXISTS suite (' +
    '    `id`                   int unsigned auto_increment NOT NULL,' +
    '    `name`                 varchar(255) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`id`),' +
    '    UNIQUE KEY (`name`),' +
    '    KEY (`name`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  sql.query(
    'CREATE TABLE IF NOT EXISTS test (' +
    '    `id`                   int unsigned auto_increment NOT NULL,' +
    '    `suite_id`             int unsigned NOT NULL,' +
    '    `name`                 varchar(255) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`id`),' +
    '    UNIQUE KEY (`suite_id`, `name`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  sql.query(
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
    '    KEY (`test_id`),' +
    '    KEY (`time`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  sql.query(
    'CREATE TABLE IF NOT EXISTS assertion (' +
    '    `id`                   int unsigned auto_increment NOT NULL,' +
    '    `message`              text NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`id`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  sql.query(
    'CREATE TABLE IF NOT EXISTS assertion_result (' +
    '    `id`                   int unsigned auto_increment NOT NULL,' +
    '    `test_result_id`       int unsigned NOT NULL,' +
    '    `assertion_id`         int unsigned NOT NULL,' +
    '    `ok`                   tinyint unsigned NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`id`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', log)

  global.events.on('test', function(test) {
  })
}

exports.setup = function(options) {
  exports.options = options
  exports.sql = mysql.createClient(options.mysql)
  setupSql(options)
}
