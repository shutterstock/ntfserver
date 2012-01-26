var async = require('async')
  , global = require('../../lib/ntfserver/global')
  , mysql = require('mysql')

exports.setUpSql = function(cb) {
  global.options = {
    mysql: {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'ntf_test',
    }
  }
  global.sql = mysql.createClient(global.options.mysql)

  var tables = ['agent', 'suite', 'test', 'test_result', 'assertion']

  async.series([
    function(cb) { global.sql.query('DROP TABLE IF EXISTS ' + tables.join(','), cb) },
    function(cb) { global.setupSql(global.options, cb) },
  ], function(err) {
    if (err) throw err
    cb()
  })
}

exports.tearDownSql = function(cb) {
  try { global.sql.destroy() } catch(err) {}
  global.sql = null
  cb()
}
