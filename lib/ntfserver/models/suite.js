var global = require('../global')

var Suite = exports.Suite = function Suite(obj) {
  this.id = obj.id
  this.name = obj.name
}

Suite.cache = {}
Suite.prototype.className = 'suite'

Suite.setup = function(cb) {
  global.sql.query(
    'CREATE TABLE IF NOT EXISTS suite (' +
    '    `suite_id`             int unsigned auto_increment NOT NULL,' +
    '    `name`                 varchar(255) NOT NULL,' +
    '    `create_time`          timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '    PRIMARY KEY (`suite_id`),' +
    '    UNIQUE KEY (`name`),' +
    '    KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Suite.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object') return cb(new Error('Requires object'))
  if (typeof(obj.name) !== 'string') return cb(new Error('Invalid name type'))
  if (Suite.cache.hasOwnProperty(obj.name)) return cb(null, Suite.cache[obj.name])

  global.sql.query(
    'INSERT INTO suite (name) VALUES (?)' +
    '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)', [obj.name],
  function(err, info) {
    if (err) return cb(err)
    Suite.cache[obj.name] = info.insertId
    var suite = Suite.cache[obj.name] = new Suite({ id: info.insertId, name: obj.name })
    cb(null, suite)
  })
}
