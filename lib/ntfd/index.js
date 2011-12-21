var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , global = require('./global')
  , periodic = require('./periodic')
  , routes = require('./routes')
  , socket = require('./socket')

exports.version = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'))['version']

exports.createServer = function(config) {
  var app = express.createServer()

  var defaultConfig = function(section, option, value) {
    if (!config.hasOwnProperty(section)) {
      config[section] = {}
    }
    if (!config[section].hasOwnProperty(option)) {
      config[section][option] = value
    }
  }

  defaultConfig('http', 'port', 8000)
  defaultConfig('http', 'secret', 'secret')
  defaultConfig('http', 'static_path', path.resolve(__dirname + '/../../static'))
  defaultConfig('http', 'template_path', path.resolve(__dirname + '/../../templates'))
  defaultConfig('http', 'access_log', '')
  defaultConfig('redis', 'host', '127.0.0.1')
  defaultConfig('redis', 'port', 6379)
  defaultConfig('redis', 'database', 0)
  defaultConfig('test', 'timeout', 60)

  app.configure(function() {
    if (config.http.access_log) app.use(express.logger())
    app.use(express.static(config.http.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('views', config.http.template_path)
    app.set('view options', { layout: false })
    app.register('.html', require('jinjs'))
  })

  app.configure('dev', 'development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })

  app.configure('prod', 'production', function() {
    app.use(express.errorHandler())
  })

  global.setup(config)

  routes(app)
  socket(app)

  periodic.run()

  return app
}
