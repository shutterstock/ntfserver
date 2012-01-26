var global = require('./global')
  , utils = require('./utils')

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.get('/test', function(req, res) {
    res.json([])
  })

  app.post('/test', function(req, res) {
    if (utils.validateTest(req.body)) {
      global.events.emit('test', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/test/:name', function(req, res) {
    res.json([])
  })

}
