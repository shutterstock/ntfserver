var api = require('./api')
  , shared = require('./shared')
  , models = require('./models')
  , utils = require('./utils')

exports.setup = function(app) {

  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.get('/events', function(req, res) {
    res.render('events.html', {})
  })

  app.get('/api', function(req, res) {
    res.json({
      'agent_url': api.url('/agent'),
      'suite_url': api.url('/suite'),
      'version': shared.package.version,
    })
  })

  app.get('/api/agent/:agent_name?', function(req, res) {
    var obj = {}

    if (req.params.agent_name) obj.agent_name = req.params.agent_name
    if (req.query.limit) obj.limit = req.query.limit

    api.getAgentList(obj, function(err, result) {
      if (err) return res.send(500)
      if (obj.agent_name) {
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

  app.post('/api/suite/result', function(req, res) {
    if (utils.validateSuite(req.body)) {
      shared.events.emit('suite', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/api/suite/:suite_name?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.query.limit) obj.limit = req.query.limit

    api.getSuiteList(obj, function(err, result) {
      if (err) return res.send(500)
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

  app.get('/api/suite/:suite_name/result/:suite_result_id?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.params.suite_result_id) obj.suite_result_id = parseInt(req.params.suite_result_id)
    if (req.query.limit) obj.limit = req.query.limit

    api.getSuiteResultList(obj, function(err, result) {
      if (err) return res.send(500)
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
