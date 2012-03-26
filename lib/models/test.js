var async = require('async')
  , shared = require('../shared')
  , suite = require('./suite')

var Test = exports.Test = function Test() {}

Test.cache = {}
Test.error = function(text) { return new Error('Test ' + text) }

Test.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS test (' +
    '  `test_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_id` int unsigned NOT NULL,' +
    '  `name` varchar(255) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`test_id`),' +
    '  UNIQUE KEY (`suite_id`, `name`),' +
    '  FOREIGN KEY (`suite_id`)' +
    '    REFERENCES suite(`suite_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Test.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(Test.error('requires object'))
  if (typeof(obj.suite_id) !== 'number')
    return cb(Test.error('invalid suite_id: ' + obj.suite_id))
  if (typeof(obj.name) !== 'string')
    return cb(Test.error('invalid name: ' + obj.name))
  var key = obj.suite_id + '|' + obj.name
  if (Test.cache.hasOwnProperty(key))
    return cb(null, Test.cache[key])

  shared.sql.query(
    'INSERT INTO test (suite_id, name) VALUES (?, ?)' +
    '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
    [obj.suite_id, obj.name],
  function(err, info) {
    if (err) return cb(err)
    Test.cache[key] = info.insertId
    cb(null, info.insertId)
  })
}
