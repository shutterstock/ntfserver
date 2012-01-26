var async = require('async')
  , global = require('../global')
  , suite = require('./suite')

var SuiteResult = exports.SuiteResult = function SuiteResult() {}

SuiteResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS suite_result (' +
    '  `suite_result_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_id` int unsigned NOT NULL,' +
    '  `agent_id` int unsigned NOT NULL,' +
    '  `duration` int unsigned NOT NULL,' +
    '  `pass_count` int unsigned NOT NULL,' +
    '  `fail_count` int unsigned NOT NULL,' +
    '  `time` int unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`suite_result_id`),' +
    '  KEY (`suite_id`),' +
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
    return cb(new Error('requires object'))
  if (typeof(obj.agent_id) !== 'number')
    return cb(new Error('invalid agent_id: ' + obj.agent_id))
  if (typeof(obj.duration) !== 'number')
    return cb(new Error('invalid duration: ' + obj.duration))
  if (typeof(obj.pass_count) !== 'number')
    return cb(new Error('invalid pass_count: ' + obj.pass_count))
  if (typeof(obj.fail_count) !== 'number')
    return cb(new Error('invalid fail_count: ' + obj.fail_count))
  if (typeof(obj.time) !== 'number')
    return cb(new Error('invalid time: ' + obj.time))

  global.sql.query(
    'INSERT INTO suite_result (suite_id, agent_id, duration, pass_count, fail_count, time)' +
    '  VALUES (?, ?, ?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE suite_result_id = last_insert_id(suite_result_id)',
    [obj.suite_id, obj.agent_id, obj.duration, obj.pass_count, obj.fail_count, obj.time],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
