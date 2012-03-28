var async = require('async')
  , fs = require('fs')
  , path = require('path')
  , helper = require('./assets/helper')
  , shared = require('../lib/shared')
  , store = require('../lib/store')

exports.setUp = helper.setUpSql
exports.tearDown = helper.tearDownSql

var suite = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets',
  'suite.json')).toString())

exports.handleSuite = function(test) {
  var work = []

  work.push(function(cb) {
    shared.sql.query('SELECT * FROM agent', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].name, 'agent')
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query('SELECT * FROM suite', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].name, 'www.example.org')
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query('SELECT * FROM suite_result', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 1)
      test.equal(results[0].duration, 36)
      test.equal(results[0].pass, 7)
      test.equal(results[0].fail, 1)
      test.equal(results[0].time, 1327609606)
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query('SELECT * FROM test ORDER BY name', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 3)
      test.equal(results[0].name, 'healthcheck')
      test.equal(results[1].name, 'robots')
      test.equal(results[2].name, 'stats')
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query(
      'SELECT t.name AS name, tr.duration AS duration,' +
      '  tr.pass AS pass, tr.fail AS fail' +
      '  FROM test_result tr' +
      '  LEFT JOIN test t ON ' +
      '  t.test_id = tr.test_id ORDER BY t.name', [],
    function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 3)
      test.equal(results[0].duration, 10)
      test.equal(results[0].pass, 3)
      test.equal(results[0].fail, 0)
      test.equal(results[1].duration, 15)
      test.equal(results[1].pass, 2)
      test.equal(results[1].fail, 0)
      test.equal(results[2].duration, 11)
      test.equal(results[2].pass, 2)
      test.equal(results[2].fail, 1)
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query('SELECT * FROM assertion ORDER BY message', [], function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 5)
      test.equal(results[0].message, 'Content contains "User-agent"')
      test.equal(results[1].message, 'Content is JSON')
      test.equal(results[2].message, 'Healthcheck is active')
      test.equal(results[3].message, 'Stats includes version')
      test.equal(results[4].message, 'Status code is 200')
      cb()
    })
  })

  work.push(function(cb) {
    shared.sql.query(
      'SELECT a.message AS message, ar.ok AS ok' +
      '  FROM ' +
      '    assertion_result ar' +
      '  LEFT JOIN assertion a ON ' +
      '    a.assertion_id = ar.assertion_id' +
      '  LEFT JOIN test_result tr ON ' +
      '    ar.test_result_id = tr.test_result_id' +
      '  LEFT JOIN test t ON ' +
      '    t.test_id = tr.test_id' +
      '  ORDER BY t.name, a.message', [],
    function(err, results) {
      if (err) return cb(err)
      test.equal(results.length, 8)
      test.equal(results[0].message, 'Content is JSON')
      test.equal(results[0].ok, 1)
      test.equal(results[1].message, 'Healthcheck is active')
      test.equal(results[1].ok, 1)
      test.equal(results[2].message, 'Status code is 200')
      test.equal(results[2].ok, 1)
      test.equal(results[3].message, 'Content contains "User-agent"')
      test.equal(results[3].ok, 1)
      test.equal(results[4].message, 'Status code is 200')
      test.equal(results[4].ok, 1)
      test.equal(results[5].message, 'Content is JSON')
      test.equal(results[5].ok, 1)
      test.equal(results[6].message, 'Stats includes version')
      test.equal(results[6].ok, 0)
      test.equal(results[7].message, 'Status code is 200')
      test.equal(results[7].ok, 1)
      cb()
    })
  })

  store.handleSuite(suite, function(err) {
    async.parallel(work, function(err) {
      test.ok(!err, err)
      test.done()
    })
  })
}
