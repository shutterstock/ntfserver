var global = require('./global')

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

exports.suiteList = function(obj, cb) {
  if (typeof(obj.limit) !== 'number' || !obj.limit) obj.limit = 100
  if (obj.limit > 1000) obj.limit = 1000
  if (obj.suite_name) obj.limit = 1

  var args = []

  if (obj.suite_name) args.push(obj.suite_name)
  args.push(obj.limit)

  global.sql.query(
    'SELECT name FROM suite' +
    (obj.suite_name ? ' WHERE name = ?' : '') +
    '  ORDER BY name LIMIT ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuite))
  })
}

exports.suiteResultList = function(obj, cb) {
  if (typeof(obj.limit) !== 'number' || !obj.limit) obj.limit = 100
  if (obj.limit > 1000) obj.limit = 1000
  if (obj.suite_result_id) obj.limit = 1

  var args = [obj.suite_name]
  if (obj.suite_result_id) args.push(obj.suite_result_id)
  args.push(obj.limit)

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
    (obj.suite_result_id ? ' AND sr.suite_result_id = ?' : '') +
    '  ORDER BY sr.time DESC, sr.suite_result_id DESC' +
    '  LIMIT ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuiteResult))
  })
}
