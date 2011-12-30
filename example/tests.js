var suite = require('ntf').utils.load(__dirname + '/tests')

var options = {
  http: {
    port: 8000,
    secret: 'changeme',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    database: 0,
  },
  test: {
    timeout: 60,
  },
}

require('ntfd').run(suite, options)
