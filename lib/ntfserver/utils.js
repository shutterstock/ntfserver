exports.validateTest = function(test) {
  return typeof(test) === 'object' &&
      typeof(test.agent) === 'string' && test.agent &&
      typeof(test.name) === 'string' && test.name &&
      typeof(test.duration) === 'number' &&
      typeof(test.failures) === 'number' &&
      typeof(test.passes) === 'number' &&
      Array.isArray(test.results)
}
