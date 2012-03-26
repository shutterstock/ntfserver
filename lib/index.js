var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , shared = require('./shared')
  , routes = require('./routes')

var rootPath = path.resolve(path.join(__dirname, '..'))

exports.version = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'))).version

exports.createServer = function(options) {
  var app = express.createServer()

  process.chdir(rootPath)

  var setDefault = function(section, option, value) {
    if (!options.hasOwnProperty(section)) {
      options[section] = {}
    }
    if (!options[section].hasOwnProperty(option)) {
      options[section][option] = value
    }
  }

  setDefault('http', 'access_log', '')
  setDefault('http', 'port', 8000)
  setDefault('http', 'secret', 'secret')
  setDefault('http', 'static_path', path.join(rootPath, 'static'))
  setDefault('http', 'template_path', path.join(rootPath, 'templates'))
  setDefault('mysql', 'host', '127.0.0.1')
  setDefault('mysql', 'port', 3306)
  setDefault('mysql', 'database', 'ntf')
  setDefault('mysql', 'user', 'root')
  setDefault('mysql', 'password', 'root')
  setDefault('redis', 'host', '127.0.0.1')
  setDefault('redis', 'port', 6379)
  setDefault('redis', 'database', 0)

  app.configure(function() {
    if (options.http.access_log) app.use(express.logger())
    app.use(express.static(options.http.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('jsonp callback', true)
    app.set('views', options.http.template_path)
    app.register('.html', require('ejs'))
  })

  app.configure('dev', 'development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })

  app.configure('prod', 'production', function() {
    app.use(express.errorHandler())
  })

  shared.setup(options)
  routes.setup(app)

  return app
}

exports.run = function(options) {
  exports.createServer(options).listen(options.http.port)
}
