var api = require('./api')
  , global = require('./global')
  , models = require('./models')
  , utils = require('./utils')

module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.post('/suite/result', function(req, res) {
    if (utils.validateSuite(req.body)) {
      global.events.emit('suite', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/suite/:suite_name?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.query.limit) obj.limit = req.query.limit

    api.suiteList(obj, function(err, result) {
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

  app.get('/suite/:suite_name/result/:suite_result_id?', function(req, res) {
    var obj = {}

    if (req.params.suite_name) obj.suite_name = req.params.suite_name
    if (req.params.suite_result_id) obj.suite_result_id = req.params.suite_result_id
    if (req.query.limit) obj.limit = req.query.limit

    api.suiteResultList(obj, function(err, result) {
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
