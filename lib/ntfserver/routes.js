var global = require('./global')

module.exports = function(app) {
  var formatTestName = function(desc) {
    desc = desc.split(' :: ')

    var html = '<a href="' + desc[0] + '">' + desc[0] + '</a>'

    if (desc[0].match(/^https?:\/\//)) {
      html = desc[1] + ' ' + html
    }

    html += ' &ndash; ' + desc[desc.length-1]

    return html
  }

  var render = function(req, res, template, data) {
    var callback = req.query.callback

    if (callback) {
      res.send('' + callback + '(' + JSON.stringify(data) + ');',
        { 'Content-Type': 'application/javascript' }, 200)
    } else if (req.accepts('html')) {
      res.render(template, { data: data, formatTestName: formatTestName })
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
    render(req, res, 'test.html', [])
  })

  app.post('/test', function(req, res) {
    res.end(201)
  })

  app.get('/test/:name', function(req, res) {
    render(req, res, 'test_single.html', [])
  })

}
