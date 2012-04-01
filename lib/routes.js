var api = require('./api')
  , shared = require('./shared')
  , models = require('./models')
  , utils = require('./utils')

exports.setup = function(app) {

  var list = function(req, obj) {
    ['limit', 'page', 'offset'].forEach(function(n) {
      if (req.query.hasOwnProperty(n)) {
        obj[n] = parseInt(req.query[n], 10)
      }
    })
    return obj
  }

  var json = function(req) {
    return req.is('json') || req.query.callback
  }

  app.get('/', function(req, res, next) {
    if (json(req)) {
      api.getIndex(function(err, result) {
        if (err) return next(err)
        res.json(result)
      })
    } else {
      api.getEventList(function(err, eventList) {
        if (err) return next(err)
        var fail = 0
        eventList.forEach(function(e) {
          fail += e.fail
        })
        res.render('index.html', { fail: fail, ok: !fail })
      })
    }
  })

  app.get('/shared.js', function(req, res, next) {
    var data = 'window.shared = {};\n';
    data += 'window.shared.filters = {};\n'
    data += 'window.shared.filters.age = ' + utils.filters.age.toString() + ';\n'
    data += 'window.shared.filters.suite_to_safe = ' + utils.filters.suite_to_safe.toString() + ';\n'
    data += 'window.shared.filters.time = ' + utils.filters.time.toString() + ';\n'
    data += 'window.shared.template = ' + JSON.stringify(shared.js.template) + ';\n'
    res.send(data, { 'Content-Type': 'application/json' }, 200)
  })

  app.get('/events', function(req, res, next) {
    api.getEventList(function(err, result) {
      if (err) return next(err)
      if (json(req)) {
        res.json(result)
      } else {
        res.render('events.html', { events: result })
      }
    })
  })

  app.get('/status', function(req, res, next) {
    api.getStatus(function(err, result) {
      if (err) return next(err)
      if (json(req)) {
        res.json(result)
      } else {
        res.render('status.html', { results: result })
      }
    })
  })

  app.get('/agents/:agent_name?', function(req, res, next) {
    var obj = {}
    if (req.params.agent_name) obj.agent_name = req.params.agent_name

    api.getAgentList(list(req, obj), function(err, result) {
      if (err) return next(err)
      if (obj.agent_name) {
        if (result.length) {
          if (json(req)) {
            res.json(result[0])
          } else {
            res.render('agents/detail.html', { agent: result[0] })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(result)
        } else {
          res.render('agents/index.html', { agents: result })
        }
      }
    })
  })

  app.post('/store', function(req, res, next) {
    if (utils.validateStore(req.body)) {
      shared.events.emit('store', req.body)
      res.send(201)
    } else {
      res.send(400)
    }
  })

  app.get('/suites/:suite_name?', function(req, res, next) {
    var obj = {}
    if (req.params.suite_name) obj.suite_name = req.params.suite_name

    api.getSuiteList(list(req, obj), function(err, result) {
      if (err) return next(err)
      if (obj.suite_name) {
        if (result.length) {
          if (json(req)) {
            res.json(result[0])
          } else {
            res.render('suites/detail.html', { suite: result[0] })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(result)
        } else {
          res.render('suites/index.html', { suites: result })
        }
      }
    })
  })

  app.get('/suites/:suite_name/results/:suite_result_id?', function(req, res, next) {
    var obj = {}

    obj.suite_name = req.params.suite_name
    if (req.params.suite_result_id) obj.suite_result_id = parseInt(req.params.suite_result_id, 10)

    api.getSuiteResultList(list(req, obj), function(err, suiteResultList) {
      if (err) return next(err)
      if (obj.suite_result_id) {
        if (suiteResultList.length) {
          if (json(req)) {
            res.json(suiteResultList[0])
          } else {
            res.render('suites/results/detail.html', { suite_result: suiteResultList[0], suite: { name: obj.suite_name } })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(suiteResultList)
        } else {
          res.render('suites/results/index.html', { suite_results: suiteResultList, suite: { name: obj.suite_name } })
        }
      }
    })
  })

  app.get('/suites/:suite_name/results/:suite_result_id/tests/:test_result_id?', function(req, res, next) {
    var obj = {}
    obj.suite_name = req.params.suite_name
    obj.suite_result_id = parseInt(req.params.suite_result_id, 10)
    if (req.params.test_result_id) obj.test_result_id = parseInt(req.params.test_result_id, 10)

    api.getTestResultList(list(req, obj), function(err, testResultList) {
      if (err) return next(err)
      if (obj.test_result_id) {
        if (testResultList.length) {
          if (json(req)) {
            res.json(testResultList[0])
          } else {
            res.render('suites/results/tests/detail.html', { test_result: testResultList[0], suite: { name: obj.suite_name } })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(testResultList)
        } else {
          res.render('suites/results/tests/index.html', { test_results: testResultList, suite: { name: obj.suite_name }, suite_result: { id: obj.suite_result_id } })
        }
      }
    })
  })

  app.get('/suites/:suite_name/results/:suite_result_id/tests/:test_result_id/assertions/:assertion_result_id?', function(req, res, next) {
    var obj = {}
    obj.suite_name = req.params.suite_name
    obj.suite_result_id = parseInt(req.params.suite_result_id, 10)
    obj.test_result_id = parseInt(req.params.test_result_id, 10)
    if (req.params.assertion_result_id) obj.assertion_result_id = parseInt(req.params.assertion_result_id, 10)

    api.getAssertionResultList(list(req, obj), function(err, assertionResultList) {
      if (err) return next(err)
      if (obj.assertion_result_id) {
        if (assertionResultList.length) {
          if (json(req)) {
            res.json(assertionResultList[0])
          } else {
            res.render('suites/results/tests/assertions/detail.html', {
              assertion_result: assertionResultList[0],
              suite: { name: obj.suite_name },
              test_result: { id: obj.test_result_id }
            })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(assertionResultList)
        } else {
          res.render('suites/results/tests/assertions/index.html', {
            assertion_results: assertionResultList,
            suite: { name: obj.suite_name },
            test_result: { id: obj.test_result_id }
          })
        }
      }
    })
  })

  app.get('/suites/:suite_name/tests/:test_name?', function(req, res, next) {
    var obj = {}
    obj.suite_name = req.params.suite_name
    if (req.params.test_name) obj.test_name = req.params.test_name

    api.getTestList(list(req, obj), function(err, testList) {
      if (err) return next(err)
      if (obj.test_name) {
        if (testList.length) {
          if (json(req)) {
            res.json(testList[0])
          } else {
            res.render('suites/tests/detail.html', { test: testList[0], suite: { name: obj.suite_name } })
          }
        } else {
          res.send(404)
        }
      } else {
        if (json(req)) {
          res.json(testList)
        } else {
          res.render('suites/tests/index.html', { tests: testList, suite: { name: obj.suite_name } })
        }
      }
    })
  })

}
