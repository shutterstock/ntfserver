var async = require('async')
  , global = require('../global')
  , test = require('./test')

var TestResult = exports.TestResult = function TestResult() {}

TestResult.error = function(text) { return new Error('TestResult ' + text) }

TestResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test_result (' +
    '  `test_result_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_result_id` int unsigned NOT NULL,' +
    '  `test_id` int unsigned NOT NULL,' +
    '  `duration` int unsigned NOT NULL,' +
    '  `pass` int unsigned NOT NULL,' +
    '  `fail` int unsigned NOT NULL,' +
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
    return cb(TestResult.error('requires object'))
  if (typeof(obj.suite_result_id) !== 'number')
    return cb(TestResult.error('invalid suite_result_id: ' + obj.suite_result_id))
  if (typeof(obj.test_id) !== 'number')
    return cb(TestResult.error('invalid test_id: ' + obj.test_id))
  if (typeof(obj.duration) !== 'number')
    return cb(TestResult.error('invalid duration: ' + obj.duration))
  if (typeof(obj.pass) !== 'number')
    return cb(TestResult.error('invalid pass: ' + obj.pass))
  if (typeof(obj.fail) !== 'number')
    return cb(TestResult.error('invalid fail: ' + obj.fail))

  global.sql.query(
    'INSERT INTO test_result (suite_result_id, test_id, duration, pass, fail)' +
    '  VALUES (?, ?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE test_result_id = last_insert_id(test_result_id)',
    [obj.suite_result_id, obj.test_id, obj.duration, obj.pass, obj.fail],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
