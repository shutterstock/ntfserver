var global = require('./global')
  , helper = require('./helper')
  , ntf = require('ntf')

module.exports = function(app) {
  var module = global.config.test.module

  var maxAge = function(req) {
    var cacheControl = req.header('cache-control')
      , timeout = global.config.test.timeout * 2

    if (!cacheControl) return timeout

    var ageAge = cacheControl.match(/max-age=([\d]+)/)
    return ageAge ? ageAge[1] : timeout
  }

  var formatTestName = function(desc) {
    desc = desc.split(ntf.utils.SEP)

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

  var parseRender = function(req, res, template, data) {
    render(req, res, template, data.map(helper.parseRedis))
  }

  app.get('/', function(req, res) {
    helper.runTests(module, { maxAge: global.config.test.timeout * 2 }, function(err, data) {
      res.render('index.html', { data: data })
    })
  })

  app.get('/test', function(req, res) {
    var data = Object.keys(module)
    data.sort()
    data = data.map(function(name) { return { name: name, url: '/test/' + name } })
    render(req, res, 'test.html', data)
  })

  app.get('/test/all', function(req, res) {
    helper.runTests(module, { maxAge: maxAge(req) }, function(err, data) {
      render(req, res, 'test_all.html', data)
    })
  })

  app.get('/test/:name', function(req, res) {
    var name = req.params.name
    if (!module[name]) return res.send(404)
    helper.runTest(name, module[name], { maxAge: maxAge(req) }, function(err, data) {
      render(req, res, 'test_single.html', [data])
    })
  })

  app.get('/test/:name/history', function(req, res) {
    var name = req.params.name
      , limit = req.query.limit
      , offset = req.query.offset
      , start = req.query.start
      , stop = req.query.stop

    if (!module[name]) return res.send(404)

    limit = parseInt(limit)
    if (isNaN(limit)) limit = 10
    if (limit <= 0) limit = 1
    if (limit >= 500) limit = 500

    offset = parseInt(offset)
    if (isNaN(offset)) offset = 0
    if (offset < 0) offset = 0

    if (start !== undefined || stop !== undefined) {
      var now = parseInt(new Date().getTime() / 1000)

      start = parseInt(start)
      if (isNaN(start)) start = now - (global.config.test.timeout * limit * 2)

      stop = parseInt(stop)
      if (isNaN(stop)) stop = now

      global.redis.zrangebyscore('test/' + name, start, stop, 'limit', offset, limit, function(err, data) {
        parseRender(req, res, 'test_single.html', data)
      })
    } else {
      var stop = (offset * -1) - 1
        , start = stop - limit + 1

      global.redis.zrange('test/' + name, start, stop, function(err, data) {
        parseRender(req, res, 'test_single.html', data)
      })
    }
  })

}
