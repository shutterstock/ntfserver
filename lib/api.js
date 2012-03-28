var shared = require('./shared')

var plusWhere = function(where, text) {
  if (typeof(where) !== 'string') where = ''
  if (!text) return where
  return where ? where + ' ' + text + ' ' : ' WHERE ' + text + ' '
}

exports.date = function(dt) {
  if (typeof(dt) !== 'object') dt = new Date(dt)
  var time = dt.getTime()
  dt.toJSON = function() { return time }
  return dt
}

exports.url = function(path) {
  return shared.options.http.url + path
}

var setupListRequest = function(req, cb) {
  if (typeof(cb) !== 'function') throw new Error('callback required')
  if (typeof(req) !== 'object') return cb(new Error('request argument must be an object'))
  // limit
  if (typeof(req.limit) !== 'number' || req.limit <= 0) req.limit = 100
  if (req.limit > 1000) req.limit = 1000
  // page
  if (typeof(req.page) === 'number') req.offset = req.limit * req.page
  // offset
  if (typeof(req.offset) !== 'number' || req.offset < 0) req.offset = 0
}

var renderAgent = function(d) {
  d.url = exports.url('/agents/' + d.name)
  return d
}

var renderAssertionResult = function(d) {
  d.agent_url = exports.url('/agents/' + d.agent)
  d.suite_url = exports.url('/suites/' + d.suite)
  d.test_url = d.suite_url + '/tests/' + d.test
  d.test_result_url = d.suite_url + '/results/' + d.suite_result + '/tests/' + d.test_result
  d.url = d.test_result_url + '/assertions/' + d.id
  d.time = exports.date(d.time)
  d.ok = !!d.ok
  return d
}

var renderEvent = function(d) {
  var r = {}
  r.summary = 'Suite "' + d.suite + '" failed ' + d.fail + ' test' + (d.fail == 1 ? '' : 's')
  r.time = exports.date(d.time)
  r.url = exports.url('/suites/' + d.suite + '/results/' + d.suite_result_id)
  return r
}

var renderSuite = function(d) {
  d.url = exports.url('/suites/' + d.name)
  d.results_url = d.url + '/results'
  d.tests_url = d.url + '/tests'
  return d
}

var renderSuiteResult = function(d) {
  d.ok = d.fail === 0
  d.url = exports.url('/suites/' + d.suite + '/results/' + d.id)
  d.tests_url = d.url + '/tests'
  d.agent_url = exports.url('/agents/' + d.agent)
  d.time = exports.date(d.time)
  d.ok = !d.fail
  return d
}

var renderTest = function(d) {
  d.suite_url = exports.url('/suites/' + d.suite)
  d.url = d.suite_url + '/tests/' + d.name
  return d
}

var renderTestResult = function(d) {
  d.agent_url = exports.url('/agents/' + d.agent)
  d.suite_url = exports.url('/suites/' + d.suite)
  d.test_url = d.suite_url + '/tests/' + d.test
  d.url = d.suite_url + '/results/' + d.suite_result + '/tests/' + d.id
  d.assertions_url = d.url + '/assertions'
  d.ok = !d.fail
  return d
}

exports.getIndex = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }

  cb(null, {
    'agents_url': exports.url('/agents'),
    'suites_url': exports.url('/suites'),
    'version': shared['package'].version
  })
}

exports.getAgentList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  if (req.agent_name) req.limit = 1

  var args = []
  if (req.agent_name) args.push(req.agent_name)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, (req.agent_name ? 'name = ?' : ''))

  shared.sql.query(
    'SELECT name FROM agent' + where +
    ' ORDER BY name LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderAgent))
  })
}

exports.getEventList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }

  shared.sql.query(
    'SELECT' +
    '  sr.suite_result_id AS suite_result_id,' +
    '  s.name AS suite,' +
    '  a.name AS agent,' +
    '  sr.duration AS duration,' +
    '  sr.pass AS pass,' +
    '  sr.fail AS fail,' +
    '  sr.time AS time' +
    '  FROM suite_result sr' +
    '  LEFT JOIN suite s' +
    '    ON sr.suite_id = s.suite_id' +
    '  LEFT JOIN agent a' +
    '    ON sr.agent_id = a.agent_id' +
    '  WHERE sr.suite_result_id IN' +
    '    (SELECT MAX(suite_result_id) FROM suite_result GROUP BY suite_id, agent_id)' +
    '    AND sr.fail > 0' +
    '  GROUP BY s.suite_id, a.agent_id', [],
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderEvent))
  })
}

exports.getSuiteList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  if (req.suite_name) req.limit = 1

  var args = []
  if (req.suite_name) args.push(req.suite_name)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, (req.suite_name ? ' name = ?' : ''))

  shared.sql.query(
    'SELECT name FROM suite' + where +
    ' ORDER BY name LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuite))
  })
}

exports.getSuiteResultList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  // suite name
  if (typeof(req.suite_name) !== 'string') {
    return cb(new Error('suite_name must be string'))
  }
  // suite result id
  if (req.hasOwnProperty('suite_result_id') &&
      typeof(req.suite_result_id) !== 'number') {
    return cb(new Error('suite_result_id must be number'))
  }
  if (req.suite_result_id) req.limit = 1

  var args = [req.suite_name]
  if (req.suite_result_id) args.push(req.suite_result_id)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, 's.name = ?')
  where = plusWhere(where, (req.suite_result_id ? ' AND sr.suite_result_id = ?' : ''))

  shared.sql.query(
    'SELECT sr.suite_result_id AS id, s.name AS suite, a.name AS agent,' +
    '  sr.duration AS duration, sr.pass AS pass,' +
    '  sr.fail AS fail, sr.time AS time' +
    '  FROM suite_result sr' +
    '  LEFT JOIN suite s' +
    '    ON sr.suite_id = s.suite_id' +
    '  LEFT JOIN agent a' +
    '    ON sr.agent_id = a.agent_id' +
    '  ' + where +
    '  ORDER BY sr.time DESC, sr.suite_result_id DESC' +
    '  LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderSuiteResult))
  })
}

exports.getTestList = function(req, cb) {
  setupListRequest(req, cb);
  // suite name
  if (typeof(req.suite_name) !== 'string') {
    return cb(new Error('suite_name must be string'))
  }
  // test name
  if (req.hasOwnProperty('test_name') &&
      typeof(req.test_name) !== 'string') {
    return cb(new Error('test_name must be string'))
  }
  if (req.test_name) req.limit = 1

  var args = [req.suite_name]
  if (req.test_name) args.push(req.test_name)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, 's.name = ?')
  where = plusWhere(where, (req.test_name ? ' AND t.name = ?' : ''))

  shared.sql.query(
    'SELECT s.name AS suite, t.name AS name' +
    '  FROM test t' +
    '  LEFT JOIN suite s' +
    '    ON t.suite_id = s.suite_id' +
    '  ' + where +
    '  ORDER BY t.name ASC' +
    '  LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderTest))
  })
}

exports.getTestResultList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  // suite name
  if (typeof(req.suite_name) !== 'string') {
    return cb(new Error('suite_name must be string'))
  }
  // suite result id
  if (typeof(req.suite_result_id) !== 'number') {
    return cb(new Error('suite_result_id must be number'))
  }
  // test result id
  if (req.hasOwnProperty('test_result_id') &&
      typeof(req.test_result_id) !== 'number') {
    return cb(new Error('test_result_id must be number'))
  }
  if (req.test_result_id) req.limit = 1

  var args = [req.suite_name, req.suite_result_id]
  if (req.test_result_id) args.push(req.test_result_id)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, 's.name = ?')
  where = plusWhere(where, 'AND sr.suite_result_id = ?')
  where = plusWhere(where, (req.test_result_id ? ' AND tr.test_result_id = ?' : ''))

  shared.sql.query(
    'SELECT tr.test_result_id AS id, tr.duration AS duration, tr.pass AS pass,' +
    '  tr.fail AS fail, tr.create_time AS time,' +
    '  sr.suite_result_id AS suite_result, s.name AS suite,' +
    '  t.name AS test, a.name AS agent' +
    '  FROM test_result tr' +
    '  LEFT JOIN test t' +
    '    ON t.test_id = tr.test_id' +
    '  LEFT JOIN suite_result sr' +
    '    ON tr.suite_result_id = sr.suite_result_id' +
    '  LEFT JOIN suite s' +
    '    ON sr.suite_id = s.suite_id' +
    '  LEFT JOIN agent a' +
    '    ON sr.agent_id = a.agent_id' +
    '  ' + where +
    '  ORDER BY tr.test_result_id DESC' +
    '  LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderTestResult))
  })
}

exports.getAssertionResultList = function(req, cb) {
  if (arguments.length == 1) { cb = req; req = {} }
  setupListRequest(req, cb);
  // suite name
  if (typeof(req.suite_name) !== 'string') {
    return cb(new Error('suite_name must be string'))
  }
  // suite result id
  if (typeof(req.suite_result_id) !== 'number') {
    return cb(new Error('suite_result_id must be number'))
  }
  // test result id
  if (typeof(req.test_result_id) !== 'number') {
    return cb(new Error('test_result_id must be number'))
  }
  // assertion result id
  if (req.hasOwnProperty('assertion_result_id') &&
      typeof(req.assertion_result_id) !== 'number') {
    return cb(new Error('assertion_result_id must be number'))
  }
  if (req.assertion_result_id) req.limit = 1

  var args = [req.suite_name, req.suite_result_id, req.test_result_id]
  if (req.assertion_result_id) args.push(req.assertion_result_id)
  args.push(req.limit)
  args.push(req.offset)

  var where = ''
  where = plusWhere(where, 's.name = ?')
  where = plusWhere(where, 'AND sr.suite_result_id = ?')
  where = plusWhere(where, 'AND tr.test_result_id = ?')
  where = plusWhere(where, (req.assertion_result_id ? 'AND ar.assertion_result_id = ?' : ''))

  shared.sql.query(
    'SELECT ar.assertion_result_id as id, ar.create_time AS time, ar.ok AS ok,' +
    '  a.message AS message, st.value AS stack_trace,' +
    '  tr.test_result_id AS test_result,' +
    '  sr.suite_result_id AS suite_result, s.name AS suite,' +
    '  t.name AS test, ag.name AS agent' +
    '  FROM assertion_result ar' +
    '  LEFT JOIN assertion a' +
    '    ON a.assertion_id = ar.assertion_id' +
    '  LEFT JOIN stack_trace st' +
    '    ON st.stack_trace_id = ar.stack_trace_id' +
    '  LEFT JOIN test_result tr' +
    '    ON tr.test_result_id = ar.test_result_id' +
    '  LEFT JOIN test t' +
    '    ON t.test_id = tr.test_id' +
    '  LEFT JOIN suite_result sr' +
    '    ON tr.suite_result_id = sr.suite_result_id' +
    '  LEFT JOIN suite s' +
    '    ON sr.suite_id = s.suite_id' +
    '  LEFT JOIN agent ag' +
    '    ON sr.agent_id = ag.agent_id' +
    '  ' + where +
    '  ORDER BY ar.assertion_result_id DESC' +
    '  LIMIT ? OFFSET ?', args,
  function(err, result) {
    if (err) return cb(err)
    cb(null, result.map(renderAssertionResult))
  })
}
