var global = require('../global')

var Assertion = exports.Assertion = function Assertion() {}

Assertion.cache = {}

Assertion.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS assertion (' +
    '  `assertion_id` int unsigned auto_increment NOT NULL,' +
    '  `message` text NOT NULL,' +
    '  `message_sha1` char(40) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`assertion_id`),' +
    '  UNIQUE KEY (`message_sha1`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Assertion.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('requires object'))
  if (typeof(obj.message) !== 'string') return cb(new Error('invalid message type'))
  if (Assertion.cache.hasOwnProperty(obj.message)) return cb(null, Assertion.cache[obj.message])

  global.sql.query(
    'INSERT INTO assertion (message, message_sha1) VALUES (?, sha1(?))' +
    '  ON DUPLICATE KEY UPDATE assertion_id = last_insert_id(assertion_id)',
    [obj.message, obj.message],
  function(err, info) {
    if (err) return cb(err)
    Assertion.cache[obj.message] = info.insertId
    cb(null, info.insertId)
  })
}
