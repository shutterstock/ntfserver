var async = require('async')
  , shared = require('../shared')
  , test = require('./test')

var AssertionResult = exports.AssertionResult = function AssertionResult() {}
AssertionResult.error = function(text) { return new Error('AssertionResult ' + text) }

AssertionResult.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS assertion_result (' +
    '  `assertion_result_id` int unsigned auto_increment NOT NULL,' +
    '  `test_result_id` int unsigned NOT NULL,' +
    '  `assertion_id` int unsigned NOT NULL,' +
    '  `ok` tinyint unsigned NOT NULL,' +
    '  `stack_trace_id` int unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`assertion_result_id`),' +
    '  KEY (`test_result_id`),' +
    '  FOREIGN KEY (`test_result_id`)' +
    '    REFERENCES test_result(`test_result_id`)' +
    '    ON DELETE CASCADE,' +
    '  FOREIGN KEY (`assertion_id`)' +
    '    REFERENCES assertion(`assertion_id`)' +
    '    ON DELETE CASCADE,' +
    '  FOREIGN KEY (`stack_trace_id`)' +
    '    REFERENCES stack_trace(`stack_trace_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

AssertionResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(AssertionResult.error('requires object'))
  if (typeof(obj.test_result_id) !== 'number')
    return cb(AssertionResult.error('invalid test_result_id: ' + obj.test_result_id))
  if (typeof(obj.assertion_id) !== 'number')
    return cb(AssertionResult.error('invalid assertion_id: ' + obj.assertion_id))
  if (typeof(obj.ok) !== 'boolean')
    return cb(AssertionResult.error('invalid boolean: ' + obj.ok))
  if (typeof(obj.stack_trace_id) !== 'number')
    return cb(AssertionResult.error('invalid stack_trace_id: ' + obj.stack_trace_id))

  shared.sql.query(
    'INSERT INTO assertion_result (test_result_id, assertion_id, ok, stack_trace_id)' +
    '  VALUES (?, ?, ?, ?)' +
    '  ON DUPLICATE KEY UPDATE assertion_result_id = last_insert_id(assertion_result_id)',
    [obj.test_result_id, obj.assertion_id, (obj.ok ? 1 : 0), obj.stack_trace_id],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
