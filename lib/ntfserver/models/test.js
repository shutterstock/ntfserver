var async = require('async')
  , global = require('../global')
  , suite = require('./suite')

var Test = exports.Test = function Test(obj) {
  this.id = obj.id
  this.suite = obj.suite
  this.name = obj.name
}

Test.cache = {}

Test.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS test (' +
    '    `test_id`              int unsigned auto_increment NOT NULL,' +
    '    `suite_id`             int unsigned NOT NULL,' +
    '    `name`                 text NOT NULL,' +
    '    `name_sha1`            char(40) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`test_id`),' +
    '    UNIQUE KEY (`suite_id`, `name_sha1`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Test.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('Requires object'))
  if (typeof(obj.suite) !== 'string' ||
     (typeof(obj.suite) == 'object' && obj.className === 'suite')) {
    return cb(new Error('Invalid suite type'))
  }
  if (typeof(obj.name) !== 'string') return cb(new Error('Invalid name type'))

  var key = (typeof(obj.suite) === 'string' ? obj.suite :
    obj.suite.name) + '|' + obj.name
  if (Test.cache.hasOwnProperty(key)) return cb(null, Test.cache[key])

  async.waterfall([
    function(cb) {
      if (typeof(obj.suite) === 'object') return cb(null, obj.suite)
      suite.Suite.getOrInsert({ name: obj.suite }, function(err, suite) {
        if (err) return cb(err)
        cb(null, suite)
      })
    },
    function(suite, cb) {
      global.sql.query(
        'INSERT INTO test (suite_id, name, name_sha1) VALUES (?, ?, sha1(?))' +
        '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
        [suite.id, obj.name, obj.name], function(err, info) {
          cb(null, suite, info)
        })
    },
    function(suite, info) {
      var test = Test.cache[key] = new Test({ id: info.insertId, suite: suite, name: obj.name })
      cb(null, test)
    }
  ], function(err) {
    if (err) cb(err)
  })
}
