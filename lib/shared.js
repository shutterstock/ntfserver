var async = require('async')
  , events = require('events')
  , fs = require('fs')
  , mysql = require('mysql')
  , redis = require('redis')
  , path = require('path')
  , util = require('util')
  , utils = require('./utils')

function Events() { events.EventEmitter.call(this) }
util.inherits(Events, events.EventEmitter)

exports.setupRedis = function(options, cb) {
  exports.redis.on('error', function(err) {
    if (!err) return
    util.log(err)
    if (cb) return cb(err)
    process.exit(1)
  })

  exports.redis.on('connect', function() {
    exports.redis.select(options.redis.database, function() {
      // handle something?
    })
    if (cb) cb()
  })
}

exports.setupSql = function(options, cb) {
  var sql = exports.sql
    , models = require('./models')

  async.series([
    function(cb) { sql.query('USE ' + options.mysql.database, cb) },
    models.Agent.setup,
    models.Suite.setup,
    models.SuiteResult.setup,
    models.Test.setup,
    models.TestResult.setup,
    models.StackTrace.setup,
    models.Assertion.setup,
    models.AssertionResult.setup,
    models.Meta.setup,
    models.MetaResult.setup
    ], function(err) {
      if (err) {
        if (cb) return cb(err)
        util.log(err)
        process.exit(1)
      } else {
        if (cb) return cb()
      }
  })
}

exports.setupEvents = function(options, cb) {
  var api = require('./api')
    , e = exports.events

  e.on('store', require('./store').handleSuite)

  e.on('suite.result', function(id) {
    if (!exports.io) return


    api.getSuiteResultList({ suite_result_id: id }, function(err, suiteResultList) {
      if (err || !suiteResultList.length) return
      var result = suiteResultList[0]
      result.suite_result_id = result.id
      delete result.id
      exports.redis.hset('/api/status', utils.suiteResultKey(result), JSON.stringify(result))
      exports.io.of('/events').emit('suite', result)
    })
  })

  if (cb) cb()
}

exports.setupJs = function() {
  var template = [
    'status_result.html'
  ]
  template.forEach(function(t) {
    exports.js.template[t] = fs.readFileSync(__dirname + '/../templates/snippets/' + t, 'utf8')
  })
}

exports.events = new Events()
exports.io = null
exports.options = null
exports['package'] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')))
exports.redis = null
exports.sql = null
exports.js = { template: {} }

exports.setup = function(options) {
  exports.options = options
  exports.redis = redis.createClient(options.redis.port, options.redis.host)
  exports.sql = mysql.createClient(options.mysql)
  exports.setupSql(options)
  exports.setupRedis(options)
  exports.setupEvents(options)
  exports.setupJs()
}
