var async = require('async')
  , global = require('../global')
  , test = require('./test')

var TestResult = exports.TestResult = function TestResult() {}

TestResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test_result (' +
    '  `test_result_id` int unsigned auto_increment NOT NULL,' +
    '  `agent_id` int unsigned NOT NULL,' +
    '  `test_id` int unsigned NOT NULL,' +
    '  `duration` int unsigned NOT NULL,' +
    '  `passes` int unsigned NOT NULL,' +
    '  `failures` int unsigned NOT NULL,' +
    '  `time` int unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`test_result_id`),' +
    '  KEY (`agent_id`),' +
    '  FOREIGN KEY (`agent_id`)' +
    '    REFERENCES agent(`agent_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`test_id`),' +
    '  FOREIGN KEY (`test_id`)' +
    '    REFERENCES test(`test_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

TestResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(new Error('requires object'))
  if (typeof(obj.agent_id) !== 'number')
    return cb(new Error('invalid agent_id: ' + obj.agent_id))
  if (typeof(obj.test_id) !== 'number')
    return cb(new Error('invalid test_id: ' + obj.test_id))
  if (typeof(obj.duration) !== 'number')
    return cb(new Error('invalid duration: ' + obj.duration))
  if (typeof(obj.passes) !== 'number')
    return cb(new Error('invalid passes: ' + obj.passes))
  if (typeof(obj.failures) !== 'number')
    return cb(new Error('invalid failures: ' + obj.failures))
  if (typeof(obj.time) !== 'number')
    return cb(new Error('invalid time: ' + obj.time))

  global.sql.query(
    'INSERT INTO test_result (agent_id, test_id, duration, passes, failures, time)' +
    '  VALUES (?, ?, ?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE test_result_id = last_insert_id(test_result_id)',
    [obj.agent_id, obj.test_id, obj.duration, obj.passes, obj.failures, obj.time],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
