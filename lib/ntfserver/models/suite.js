var global = require('../global')

var Suite = exports.Suite = function Suite(obj) {
  this.name = obj.name
}

Suite.prototype.render = function() {
  return {
    name: this.name,
    url: global.options.http.url + '/suite/' + this.name,
  }
}

Suite.cache = {}

Suite.setup = function(cb) {
  global.sql.query(
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
    return cb(new Error('requires object'))
  if (typeof(obj.name) !== 'string')
    return cb(new Error('invalid name type'))
  if (Suite.cache.hasOwnProperty(obj.name))
    return cb(null, Suite.cache[obj.name])

  global.sql.query(
    'INSERT INTO suite (name) VALUES (?)' +
    '  ON DUPLICATE KEY UPDATE suite_id = last_insert_id(suite_id)',
    [obj.name],
  function(err, info) {
    if (err) return cb(err)
    Suite.cache[obj.name] = info.insertId
    cb(null, info.insertId)
  })
}

Suite.get = function(name, cb) {
  Suite.query('WHERE name = ? LIMIT 1', [name], function(err, result) {
    if (err) return cb(err)
    if (result && result.length > 0) return cb(null, result[0])
    cb()
  })
}

Suite.query = function(where, list, cb) {
  list = list || []
  global.sql.query('SELECT name FROM suite' + (where ? ' ' + where : ''), list, function(err, result) {
      if (err) return cb(err)
      cb(null, result.map(function(obj) { return new Suite(obj) } ))
    }
  )
}
