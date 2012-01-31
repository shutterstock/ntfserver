exports.validateSuite = function(suite) {
  return typeof(suite) === 'object' &&
      typeof(suite.agent) === 'string' && suite.agent &&
      typeof(suite.name) === 'string' && suite.name &&
      typeof(suite.duration) === 'number' &&
      typeof(suite.failures) === 'number' &&
      typeof(suite.passes) === 'number' &&
      typeof(suite.tests) === 'object'
}
