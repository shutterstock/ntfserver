exports.validateStore = function(suite) {
  return typeof(suite) === 'object' &&
      typeof(suite.agent) === 'string' && suite.agent &&
      typeof(suite.name) === 'string' && suite.name &&
      typeof(suite.duration) === 'number' &&
      typeof(suite.fail) === 'number' &&
      typeof(suite.pass) === 'number' &&
      typeof(suite.tests) === 'object'
}

var SECOND = exports.SECOND = 1000
  , MINUTE = exports.MINUTE = 60 * SECOND
  , HOUR = exports.HOUR = 60 * MINUTE
  , DAY = exports.DAY = 24 * HOUR

exports.filters = {
  age: function(input) {
    var now = new Date()
      , delta = now.getTime() - input.getTime()
      , age = null
      , type = null

    if (delta < HOUR) {
      age = parseInt(delta / MINUTE, 10)
      type = 'minute'
    } else if (delta < DAY) {
      age = parseInt(delta / HOUR, 10)
      type = 'hour'
    } else {
      age = parseInt(delta / DAY, 10)
      type = 'day'
    }

    return '' + age + ' ' + type + (age == 1 ? '' : 's') + ' ago'
  }
}
