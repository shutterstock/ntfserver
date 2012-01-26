exports.Agent = require('./agent').Agent
exports.Suite = require('./suite').Suite
exports.Test = require('./test').Test
exports.TestResult = require('./test_result').TestResult
exports.Assertion = require('./assertion').Assertion
exports.AssertionResult = require('./assertion_result').AssertionResult

exports.clearCache = function() {
  exports.Agent.cache = {}
  exports.Suite.cache = {}
  exports.Test.cache = {}
  exports.Assertion.cache = {}
}
