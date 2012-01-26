var async = require('async')
  , global = require('../global')
  , test = require('./test')

var AssertionResult = exports.AssertionResult = function AssertionResult() {}

AssertionResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS assertion_result (' +
    '  `assertion_result_id`  int unsigned auto_increment NOT NULL,' +
    '  `test_result_id`       int unsigned NOT NULL,' +
    '  `assertion_id`         int unsigned NOT NULL,' +
    '  `ok`                   tinyint unsigned NOT NULL,' +
    '  `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`assertion_result_id`),' +
    '  KEY (`test_result_id`),' +
    '  FOREIGN KEY (`test_result_id`)' +
    '    REFERENCES test_result(`test_result_id`)' +
    '    ON DELETE CASCADE,' +
    '  FOREIGN KEY (`assertion_id`)' +
    '    REFERENCES assertion(`assertion_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

AssertionResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(new Error('requires object'))
  if (typeof(obj.test_result_id) !== 'number')
    return cb(new Error('invalid test_result_id: ' + obj.test_result_id))
  if (typeof(obj.assertion_id) !== 'number')
    return cb(new Error('invalid assertion_id: ' + obj.assertion_id))
  if (typeof(obj.ok) !== 'boolean')
    return cb(new Error('invalid boolean: ' + obj.ok))

  global.sql.query(
    'INSERT INTO assertion_result (test_result_id, assertion_id, ok)' +
    '  VALUES (?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE test_result_id = last_insert_id(test_result_id)',
    [obj.test_result_id, obj.assertion_id, (obj.ok ? 1 : 0)],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
