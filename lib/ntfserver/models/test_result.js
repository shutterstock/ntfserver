var async = require('async')
  , global = require('../global')
  , test = require('./test')

var TestResult = exports.TestResult = function TestResult() {}

TestResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test_result (' +
    '  `test_result_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_result_id` int unsigned NOT NULL,' +
    '  `test_id` int unsigned NOT NULL,' +
    '  `duration` int unsigned NOT NULL,' +
    '  `pass_count` int unsigned NOT NULL,' +
    '  `fail_count` int unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`test_result_id`),' +
    '  KEY (`suite_result_id`),' +
    '  FOREIGN KEY (`suite_result_id`)' +
    '    REFERENCES suite_result(`suite_result_id`)' +
    '    ON DELETE CASCADE,' +
    '  FOREIGN KEY (`test_id`)' +
    '    REFERENCES test(`test_id`)' +
    '    ON DELETE CASCADE' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

TestResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(new Error('requires object'))
  if (typeof(obj.suite_result_id) !== 'number')
    return cb(new Error('invalid suite_result_id: ' + obj.suite_result_id))
  if (typeof(obj.test_id) !== 'number')
    return cb(new Error('invalid test_id: ' + obj.test_id))
  if (typeof(obj.duration) !== 'number')
    return cb(new Error('invalid duration: ' + obj.duration))
  if (typeof(obj.pass_count) !== 'number')
    return cb(new Error('invalid pass_count: ' + obj.pass_count))
  if (typeof(obj.fail_count) !== 'number')
    return cb(new Error('invalid fail_count: ' + obj.fail_count))

  global.sql.query(
    'INSERT INTO test_result (suite_result_id, test_id, duration, pass_count, fail_count)' +
    '  VALUES (?, ?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE test_result_id = last_insert_id(test_result_id)',
    [obj.suite_result_id, obj.test_id, obj.duration, obj.pass_count, obj.fail_count],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
