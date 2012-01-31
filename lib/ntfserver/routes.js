var global = require('./global')
  , models = require('./models')
  , utils = require('./utils')

var renderSuite = function(d) {
  d.url = global.options.http.url + '/suite/' + d.name
  d.result_url = d.url + '/result'
  return d
}

var renderSuiteResult = function(d) {
  d.ok = d.failures == 0
  d.url = global.options.http.url + '/suite/' + d.name + '/result/' + d.id
  d.agent_url = global.options.http.url + '/agent/' + d.agent
  delete d.name
  delete d.id
  return d
}

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

  app.get('/suite/:suite?', function(req, res) {
    var  suite = req.params.suite

    if (suite) {
      var args = [suite, 1]
    } else {
      var args = [(req.query.limit ? parseInt(req.query.limit) : 100)]
    }

    global.sql.query(
      'SELECT name FROM suite' +
      ( suite ? ' WHERE name = ?' : '') +
      '  ORDER BY name LIMIT ?', args,
    function(err, result) {
      if (err) return res.send(500)
      if (suite) {
        if (result.length) {
          res.json(renderSuite(result[0]))
        } else {
          res.send(404)
        }
      } else {
        res.json(result.map(renderSuite))
      }
    })
  })

  app.get('/suite/:suite/result/:id?', function(req, res) {
    var id = req.params.id

    var args = [req.params.suite]
    if (id) {
      args.push(id)
      args.push(1)
    } else {
      args.push(req.query.limit ? parseInt(req.query.limit) : 100)
    }

    global.sql.query(
      'SELECT sr.suite_result_id AS id, s.name AS name, a.name AS agent,' +
      '  sr.duration AS duration, sr.passes AS passes,' +
      '  sr.failures AS failures, sr.time AS time' +
      '  FROM suite_result sr' +
      '  LEFT JOIN suite s' +
      '    ON sr.suite_id = s.suite_id' +
      '  LEFT JOIN agent a' +
      '    ON sr.agent_id = a.agent_id' +
      '  WHERE s.name = ?' +
      ( id ? ' AND sr.suite_result_id = ?' : '') +
      '  ORDER BY sr.time DESC, sr.suite_result_id DESC' +
      '  LIMIT ?', args,
    function(err, result) {
      if (err) return res.send(500)
      if (!result || !result.length) return res.send(404)
      if (id) {
        if (result.length) {
          res.json(renderSuiteResult(result[0]))
        } else {
          res.send(404)
        }
      } else {
        res.json(result.map(renderSuiteResult))
      }
    })
  })

}
