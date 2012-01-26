var async = require('async')
  , global = require('../global')
  , test = require('./test')

var TestResult = exports.TestResult = function TestResult(obj) {}

TestResult.cache = {}

TestResult.setup = function(cb) {
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

TestResult.insert = function(obj, cb) {
  cb(new Error('not implemented'))
}
