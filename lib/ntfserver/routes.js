var global = require('./global')

module.exports = function(app) {
  var render = function(req, res, data) {
    var callback = req.query.callback

    if (callback) {
      res.send('' + callback + '(' + JSON.stringify(data) + ');',
        { 'Content-Type': 'application/javascript' }, 200)
    } else if (req.accepts('json')) {
      res.json(data)
    } else {
      res.send(415)
    }
  }

  app.get('/', function(req, res) {
    res.render('index.html', {})
  })

  app.get('/test', function(req, res) {
    render(req, res, [])
  })

  app.post('/test', function(req, res) {
    res.end(201)
  })

  app.get('/test/:name', function(req, res) {
    render(req, res, [])
  })

}
