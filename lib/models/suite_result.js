var async = require('async')
  , shared = require('../shared')
  , suite = require('./suite')

var SuiteResult = exports.SuiteResult = function SuiteResult() {}

SuiteResult.error = function(text) { return new Error('SuiteResult ' + text) }

SuiteResult.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS suite_result (' +
    '  `suite_result_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_id` int unsigned NOT NULL,' +
    '  `agent_id` int unsigned NOT NULL,' +
    '  `duration` int unsigned NOT NULL,' +
    '  `pass` int unsigned NOT NULL,' +
    '  `fail` int unsigned NOT NULL,' +
    '  `time` bigint unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`suite_result_id`),' +
    '  KEY agent_suite_time (`agent_id`, `suite_id`, `time`),' +
    '  FOREIGN KEY (`suite_id`)' +
    '    REFERENCES suite(`suite_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`agent_id`),' +
    '  FOREIGN KEY (`agent_id`)' +
    '    REFERENCES agent(`agent_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

SuiteResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(SuiteResult.error('requires object'))
  if (typeof(obj.agent_id) !== 'number')
    return cb(SuiteResult.error('invalid agent_id: ' + obj.agent_id))
  if (typeof(obj.duration) !== 'number')
    return cb(SuiteResult.error('invalid duration: ' + obj.duration))
  if (typeof(obj.pass) !== 'number')
    return cb(SuiteResult.error('invalid pass: ' + obj.pass))
  if (typeof(obj.fail) !== 'number')
    return cb(SuiteResult.error('invalid fail: ' + obj.fail))
  if (typeof(obj.time) !== 'number')
    return cb(SuiteResult.error('invalid time: ' + obj.time))

  shared.sql.query(
    'INSERT INTO suite_result (suite_id, agent_id, duration, pass, fail, time)' +
    '  VALUES (?, ?, ?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE suite_result_id = last_insert_id(suite_result_id)',
    [obj.suite_id, obj.agent_id, obj.duration, obj.pass, obj.fail, obj.time],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
