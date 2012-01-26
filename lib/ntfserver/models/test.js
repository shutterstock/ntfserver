var async = require('async')
  , global = require('../global')
  , suite = require('./suite')

var Test = exports.Test = function Test() {}

Test.cache = {}

Test.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test (' +
    '  `test_id` int unsigned auto_increment NOT NULL,' +
    '  `suite_id` int unsigned NOT NULL,' +
    '  `name` text NOT NULL,' +
    '  `name_sha1` char(40) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`test_id`),' +
    '  UNIQUE KEY (`suite_id`, `name_sha1`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Test.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('requires object'))
  if (typeof(obj.suite_id) !== 'number') return cb(new Error('invalid suite_id: ' + obj.suite_id))
  if (typeof(obj.name) !== 'string') return cb(new Error('invalid name: ' + obj.name))

  var key = obj.suite_id + '|' + obj.name
  if (Test.cache.hasOwnProperty(key)) return cb(null, Test.cache[key])

  global.sql.query(
    'INSERT INTO test (suite_id, name, name_sha1) VALUES (?, ?, sha1(?))' +
    '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
    [obj.suite_id, obj.name, obj.name],
  function(err, info) {
    if (err) return cb(err)
    Test.cache[key] = info.insertId
    cb(null, info.insertId)
  })
}
