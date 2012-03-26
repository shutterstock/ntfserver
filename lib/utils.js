exports.validateSuite = function(suite) {
  return typeof(suite) === 'object' &&
      typeof(suite.agent) === 'string' && suite.agent &&
      typeof(suite.name) === 'string' && suite.name &&
      typeof(suite.duration) === 'number' &&
      typeof(suite.fail) === 'number' &&
      typeof(suite.pass) === 'number' &&
      typeof(suite.tests) === 'object'
}
