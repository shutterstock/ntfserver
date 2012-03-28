var shared = require('../shared')

var StackTrace = exports.StackTrace = function StackTrace() {}

StackTrace.cache = {}
StackTrace.error = function(text) { return new Error('StackTrace ' + text) }

StackTrace.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS stack_trace (' +
    '  `stack_trace_id` int unsigned auto_increment NOT NULL,' +
    '  `value` text NOT NULL,' +
    '  `value_sha1` char(40) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`stack_trace_id`),' +
    '  UNIQUE KEY (`value_sha1`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

StackTrace.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(StackTrace.error('requires object'))
  if (typeof(obj.value) !== 'string')
    return cb(StackTrace.error('invalid value type'))
  var key = obj.value
  if (StackTrace.cache.hasOwnProperty(key))
    return cb(null, StackTrace.cache[key])

  shared.sql.query(
    'INSERT INTO stack_trace (value, value_sha1) VALUES (?, sha1(?))' +
    '  ON DUPLICATE KEY UPDATE stack_trace_id = last_insert_id(stack_trace_id)',
    [obj.value, obj.value],
  function(err, info) {
    if (err) return cb(err)
    StackTrace.cache[obj.value] = info.insertId
    cb(null, info.insertId)
  })
}
