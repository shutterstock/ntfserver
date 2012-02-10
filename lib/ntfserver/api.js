var global = require('./global')

var setupListRequest = function(req, cb) {
  if (typeof(cb) !== 'function') throw new Error('callback required')
  if (typeof(req) !== 'object') return cb(new Error('request argument must be an object'))
  // number
  if (typeof(req.limit) !== 'number' || !req.limit) req.limit = 100
  if (req.limit > 1000) req.limit = 1000
}

var renderAgent = function(d) {
  d.url = '/agent/' + d.name
  return d
}

var renderSuite = function(d) {
  d.url = '/suite/' + d.name
  d.result_url = d.url + '/result'
  return d
}

var renderSuiteResult = function(d) {
  d.ok = d.failures == 0
  d.url = '/suite/' + d.suite + '/result/' + d.id
  d.agent_url = '/agent/' + d.agent
  return d
}

exports.getAgentList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  if (req.agent_name) req.limit = 1

  var args = []
  if (req.agent_name) args.push(req.agent_name)
  args.push(req.limit)

  global.sql.query(
    'SELECT name FROM agent' +
    (req.agent_name ? ' WHERE name = ?' : '') +
    '  ORDER BY name LIMIT ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderAgent))
  })
}

exports.getSuiteList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  if (req.suite_name) req.limit = 1

  var args = []
  if (req.suite_name) args.push(req.suite_name)
  args.push(req.limit)

  global.sql.query(
    'SELECT name FROM suite' +
    (req.suite_name ? ' WHERE name = ?' : '') +
    '  ORDER BY name LIMIT ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuite))
  })
}

exports.getSuiteResultList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  // suite result id
  if (req.hasOwnProperty('suite_result_id') &&
      typeof(req.suite_result_id) !== 'number') {
    return cb(new Error('suite_result_id must be number'))
  }
  if (req.suite_result_id) req.limit = 1

  var args = [req.suite_name]
  if (req.suite_result_id) args.push(req.suite_result_id)
  args.push(req.limit)

  global.sql.query(
    'SELECT sr.suite_result_id AS id, s.name AS suite, a.name AS agent,' +
    '  sr.duration AS duration, sr.passes AS passes,' +
    '  sr.failures AS failures, sr.time AS time' +
    '  FROM suite_result sr' +
    '  LEFT JOIN suite s' +
    '    ON sr.suite_id = s.suite_id' +
    '  LEFT JOIN agent a' +
    '    ON sr.agent_id = a.agent_id' +
    '  WHERE s.name = ?' +
    (req.suite_result_id ? ' AND sr.suite_result_id = ?' : '') +
    '  ORDER BY sr.time DESC, sr.suite_result_id DESC' +
    '  LIMIT ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuiteResult))
  })
}
