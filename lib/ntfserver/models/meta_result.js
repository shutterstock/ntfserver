var async = require('async')
  , global = require('../global')
  , test = require('./test')

var MetaResult = exports.MetaResult = function MetaResult() {}

MetaResult.error = function(text) { return new Error('MetaResult ' + text) }

MetaResult.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS meta_result (' +
    '  `meta_result_id` int unsigned auto_increment NOT NULL,' +
    '  `test_result_id` int unsigned NOT NULL,' +
    '  `meta_id` int unsigned NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`meta_result_id`),' +
    '  KEY (`test_result_id`),' +
    '  FOREIGN KEY (`test_result_id`)' +
    '    REFERENCES test_result(`test_result_id`)' +
    '    ON DELETE CASCADE,' +
    '  FOREIGN KEY (`meta_id`)' +
    '    REFERENCES meta(`meta_id`)' +
    '    ON DELETE CASCADE,' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

MetaResult.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(MetaResult.error('requires object'))
  if (typeof(obj.test_result_id) !== 'number')
    return cb(MetaResult.error('invalid test_result_id: ' + obj.test_result_id))
  if (typeof(obj.meta_id) !== 'number')
    return cb(MetaResult.error('invalid meta_id: ' + obj.meta_id))

  global.sql.query(
    'INSERT INTO meta_result (test_result_id, meta_id)' +
    '  VALUES (?, ?)' +
    '  ON DUPLICATE KEY UPDATE meta_result_id = last_insert_id(meta_result_id)',
    [obj.test_result_id, obj.meta_id],
  function(err, info) {
    if (err) return cb(err)
    cb(null, info.insertId)
  })
}
