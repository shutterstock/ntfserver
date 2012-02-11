var global = require('../global')

var Assertion = exports.Assertion = function Assertion() {}

Assertion.cache = {}
Assertion.error = function(text) { return new Error('Assertion ' + text) }

Assertion.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS assertion (' +
    '  `assertion_id` int unsigned auto_increment NOT NULL,' +
    '  `name` text NOT NULL,' +
    '  `name_sha1` char(40) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`assertion_id`),' +
    '  UNIQUE KEY (`name_sha1`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Assertion.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(Assertion.error('requires object'))
  if (typeof(obj.name) !== 'string')
    return cb(Assertion.error('invalid name type'))
  if (Assertion.cache.hasOwnProperty(obj.name))
    return cb(null, Assertion.cache[obj.name])

  global.sql.query(
    'INSERT INTO assertion (name, name_sha1) VALUES (?, sha1(?))' +
    '  ON DUPLICATE KEY UPDATE assertion_id = last_insert_id(assertion_id)',
    [obj.name, obj.name],
  function(err, info) {
    if (err) return cb(err)
    Assertion.cache[obj.name] = info.insertId
    cb(null, info.insertId)
  })
}
