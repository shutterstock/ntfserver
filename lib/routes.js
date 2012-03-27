var api = require('./api')
  , shared = require('./shared')
  , models = require('./models')
  , utils = require('./utils')

exports.setup = function(app) {

  var json = function(req) {
    return req.is('json') || req.query.format == 'json'
  }

  app.get('/', function(req, res, next) {
    if (json(req)) {
      api.getIndex(function(err, result) {
        if (err) return next(err)
        res.json(result)
      })
    } else {
      res.render('index.html', {})
    }
  })

  app.get('/events', function(req, res, next) {
    api.getEventList(function(err, result) {
      if (err) return next(err)
      if (json(req)) {
        res.json(result)
      } else {
        res.render('events.html', { events: result })
      }
    })
  })

  app.get('/agents/:agent_name?', function(req, res, next) {
    var obj = {}

    if (req.params.agent_name) obj.agent_name = req.params.agent_name
    if (req.query.limit) obj.limit = req.query.limit

    api.getAgentList(obj, function(err, result) {
      if (err) return next(err)
      if (obj.agent_name) {
        if (result.length) {
          if (json(req)) {
            res.json(result[0])
          } else {
            res.render('agents/detail.html', { agent: result[0] })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(result)
        } else {
          res.render('agents/index.html', { agents: result })
        }
      }
    })
  })

  app.post('/store', function(req, res) {
    if (utils.validateStore(req.body)) {
      shared.events.emit('suite', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/suites/:suite_name?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.query.limit) obj.limit = req.query.limit

    api.getSuiteList(obj, function(err, result) {
      if (err) return next(err)
      if (obj.suite_name) {
        if (result.length) {
          res.json(result[0])
        } else {
          res.send(404)
        }
      } else {
        res.json(result)
      }
    })
  })

  app.get('/suites/:suite_name/results/:suite_result_id?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.params.suite_result_id) obj.suite_result_id = parseInt(req.params.suite_result_id, 10)
    if (req.query.limit) obj.limit = req.query.limit

    api.getSuiteResultList(obj, function(err, result) {
      if (err) return next(err)
      if (obj.suite_result_id) {
        if (result.length) {
          res.json(result[0])
        } else {
          res.send(404)
        }
      } else {
        res.json(result)
      }
    })
  })

}
