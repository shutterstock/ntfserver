var global = require('./global')
  , models = require('./models')
  , utils = require('./utils')

module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.get('/suite', function(req, res) {
    models.Suite.query(null, function(err, result) {
      if (err) {
        res.send(500)
      } else {
        res.json(result.map(function(suite) {
          return suite.render()
        }))
      }
    })
  })

  app.post('/suite/result', function(req, res) {
    if (utils.validateSuite(req.body)) {
      global.events.emit('suite', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/suite/:suite', function(req, res) {
    models.Suite.get(req.params.suite, function(err, result) {
      if (err) {
        res.send(500)
      } else if (result) {
        res.json(result.render())
      } else {
        res.send(404)
      }
    })
  })

}
