var global = require('./global')
  , utils = require('./utils')

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.get('/suite', function(req, res) {
    res.json([])
  })

  app.get('/suite/:suite', function(req, res) {
    res.json({}, 404)
  })

  app.post('/suite/:suite', function(req, res) {
    if (utils.validateSuite(req.body) && req.body.name === req.params.suite) {
      global.events.emit('suite', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

}
