var global = require('./global')
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

  app.get('/suite', function(req, res) {
    var limit = parseInt(req.query.limit || 100)

    global.sql.query('SELECT name FROM suite ORDER BY name LIMIT ?', [limit], function(err, result) {
      if (err) return res.send(500)
      res.json(result.map(function(d) {
        d.url = global.options.http.url + '/suite/' + d.name
        d.result_url = d.url + '/result'
        return d
      }))
    })
  })

  app.get('/suite/:suite', function(req, res) {
    var suite_name = req.params.suite
    global.sql.query('SELECT name FROM suite WHERE name = ? LIMIT 1', [suite_name], function(err, result) {
      if (err) return res.send(500)
      if (!result || !result.length) return res.send(404)
      var d = result[0]
      d.url = global.options.http.url + '/suite/' + d.name
      d.result_url = d.url + '/result'
      res.json(d)
    })
  })

  app.get('/suite/:suite/result', function(req, res) {
    var limit = parseInt(req.query.limit || 100)
      , suite_name = req.params.suite

    global.sql.query(
      'SELECT sr.suite_result_id AS id, a.name AS agent,' +
      '  sr.duration AS duration, sr.pass_count AS passes,' +
      '  sr.fail_count AS failures, sr.time AS timestamp' +
      '  FROM suite_result sr' +
      '  LEFT JOIN suite s' +
      '    ON sr.suite_id = s.suite_id' +
      '  LEFT JOIN agent a' +
      '    ON sr.agent_id = a.agent_id' +
      '  WHERE s.name = ?' +
      '  ORDER BY sr.time DESC, sr.suite_result_id DESC' +
      '  LIMIT ?',
      [suite_name, limit],
    function(err, result) {
      if (err) return res.send(500)
      if (!result || !result.length) return res.send(404)
      res.json(result.map(function(d) {
        d.url = global.options.http.url + '/suite/' + suite_name + '/result/' + d.id
        d.agent_url = global.options.http.url + '/agent/' + d.agent
        delete d.id
        return d
      }))
    })
  })

}
