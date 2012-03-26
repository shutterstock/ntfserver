var shared = require('../shared')

var Suite = exports.Suite = function Suite() {}

Suite.cache = {}
Suite.error = function(text) { return new Error('Suite ' + text) }

Suite.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS suite (' +
    '  `suite_id` int unsigned auto_increment NOT NULL,' +
    '  `name` varchar(255) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`suite_id`),' +
    '  UNIQUE KEY (`name`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Suite.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(Suite.error('requires object'))
  if (typeof(obj.name) !== 'string')
    return cb(Suite.error('invalid name type'))
  if (Suite.cache.hasOwnProperty(obj.name))
    return cb(null, Suite.cache[obj.name])

  shared.sql.query(
    'INSERT INTO suite (name) VALUES (?)' +
    '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
    [obj.name],
  function(err, info) {
    if (err) return cb(err)
    Suite.cache[obj.name] = info.insertId
    cb(null, info.insertId)
  })
}
