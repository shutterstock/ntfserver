var async = require('async')
  , global = require('../global')
  , suite = require('./suite')

var Test = exports.Test = function Test() {}

Test.cache = {}

Test.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test_result (' +
    '    `test_result_id`       int unsigned auto_increment NOT NULL,' +
    '    `agent_id`             int unsigned NOT NULL,' +
    '    `test_id`              int unsigned NOT NULL,' +
    '    `duration`             int unsigned NOT NULL,' +
    '    `passes`               int unsigned NOT NULL,' +
    '    `failures`             int unsigned NOT NULL,' +
    '    `time`                 int unsigned NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`test_result_id`),' +
    '    KEY (`agent_id`),' +
    '    KEY (`test_id`),' +
    '    KEY (`time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Test.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('Requires object'))
  if (typeof(obj.suite) !== 'string') return cb(new Error('Invalid suite type'))
  if (typeof(obj.name) !== 'string') return cb(new Error('Invalid name type'))
  if (Test.cache.hasOwnProperty(obj.suite)) {
    if (Test.cache[obj.suite].hasOwnProperty(obj.name)) {
      return cb(null, Test.cache[obj.suite][obj.name])
    } else {
      Test.cache[obj.suite][obj.name] = {}
    }
  } else {
    Test.cache[obj.suite] = {}
  }

  async.waterfall([
    function(cd) {
      suite.Suite.getOrInsert({ name: obj.suite }, function(err, id) {
        if (err) return cb(err)
        cb(null, id)
      })
    },
    function(suite_id, cb) {
      global.sql.query(
        'INSERT INTO test (suite_id, name, name_sha1) VALUES (?, ?, sha1(?))' +
        '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
        [obj.name], cb)
    },
    function(info) {
      Test.cache[obj.name] = info.insertId
      cb(null, info.insertId)
    }
  ], cb)
}
