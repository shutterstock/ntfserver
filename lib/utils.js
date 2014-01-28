var swig = require('swig');

exports.validateStore = function(suite) {
  return typeof(suite) === 'object' &&
      typeof(suite.agent) === 'string' && suite.agent &&
      typeof(suite.name) === 'string' && suite.name &&
      typeof(suite.duration) === 'number' &&
      typeof(suite.fail) === 'number' &&
      typeof(suite.pass) === 'number' &&
      typeof(suite.tests) === 'object'
}

exports.filters = {
  age: function(input) {
    var SECOND = 1000;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
    var now = new Date();
    var delta = now.getTime() - input.getTime();
    var age = null;
    var type = null;

    if (delta < MINUTE) {
      age = parseInt(delta / SECOND, 10);
      type = 'second';
    } else if (delta < HOUR) {
      age = parseInt(delta / MINUTE, 10);
      type = 'minute';
    } else if (delta < DAY) {
      age = parseInt(delta / HOUR, 10);
      type = 'hour';
    } else {
      age = parseInt(delta / DAY, 10);
      type = 'day';
    }

    return '' + age + ' ' + type + (age == 1 ? '' : 's') + ' ago';
  },
  time: function(input) {
    return typeof(input) == 'object' ? input.getTime() : input;
  },
  suite_to_safe: function(input) {
    try {
      return input.replace(/\./g, '-');
    } catch (err) {
      return input;
    }
  }
}

swig.setFilter('age',exports.filters.age);
swig.setFilter('time',exports.filters.time);
swig.setFilter('suite_to_safe',exports.filters.suite_to_safe);

exports.suiteResultKey = function(result) {
  return [result.suite, result.agent].join('-')
}
