var global = require('../global')

var Meta = exports.Meta = function Meta() {}

Meta.cache = {}

Meta.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS meta (' +
    '  `meta_id` int unsigned auto_increment NOT NULL,' +
    '  `name` varchar(255) NOT NULL,' +
    '  `value` varchar(255) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`meta_id`),' +
    '  UNIQUE KEY (`name`, `value`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Meta.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(new Error('requires object'))
  if (typeof(obj.name) !== 'string')
    return cb(new Error('invalid name type'))
  if (typeof(obj.value) !== 'string')
    return cb(new Error('invalid value type'))
  var key = obj.name + '|' + obj.value
  if (Meta.cache.hasOwnProperty(key))
    return cb(null, Meta.cache[key])

  global.sql.query(
    'INSERT INTO meta (name, value) VALUES (?, ?)' +
    '  ON DUPLICATE KEY UPDATE meta_id = last_insert_id(meta_id)',
    [obj.name, obj.value],
  function(err, info) {
    if (err) return cb(err)
    Meta.cache[obj.name] = info.insertId
    cb(null, info.insertId)
  })
}
