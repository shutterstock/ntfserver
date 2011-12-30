var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , global = require('./global')
  , periodic = require('./periodic')
  , routes = require('./routes')
  , socket = require('./socket')

exports.version = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'))['version']

exports.createServer = function(suite, options) {
  var app = express.createServer()

  process.chdir(__dirname)

  var setDefault = function(section, option, value) {
    if (!options.hasOwnProperty(section)) {
      options[section] = {}
    }
    if (!options[section].hasOwnProperty(option)) {
      options[section][option] = value
    }
  }

  setDefault('http', 'port', 8000)
  setDefault('http', 'secret', 'secret')
  setDefault('http', 'static_path', path.resolve(__dirname + '/../../static'))
  setDefault('http', 'template_path', path.resolve(__dirname + '/../../templates'))
  setDefault('http', 'access_log', '')
  setDefault('redis', 'host', '127.0.0.1')
  setDefault('redis', 'port', 6379)
  setDefault('redis', 'database', 0)
  setDefault('test', 'timeout', 60)

  app.configure(function() {
    if (options.http.access_log) app.use(express.logger())
    app.use(express.static(options.http.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('views', options.http.template_path)
    app.set('view options', { layout: false })
    app.register('.html', require('jinjs'))
  })

  app.configure('dev', 'development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })

  app.configure('prod', 'production', function() {
    app.use(express.errorHandler())
  })

  global.setup(suite, options)

  routes(app)
  socket(app)

  periodic.run()

  return app
}

exports.run = function(suite, options) {
  exports.createServer(suite, options).listen(options.http.port)
}
