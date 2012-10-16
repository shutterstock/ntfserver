var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , io = require('socket.io')
  , setting = require('setting')
  , swig = require('swig')
  , routes = require('./routes')
  , shared = require('./shared')
  , utils = require('./utils')

var rootPath = path.resolve(path.join(__dirname, '..'))

exports.createServer = function() {
  var app = express.createServer()

  process.chdir(rootPath)

  setting('env', 'dev', 'development')
  setting('env', 'prod', 'production')
  setting('project', 'root_path', path.resolve(path.join(__dirname, '..')))
  setting('project', 'static_path', path.join(setting.project.root_path, 'static'))
  setting('project', 'template_path', path.join(setting.project.root_path, 'templates'))
  setting('http', 'access_log', false)
  setting('http', 'host', '127.0.0.1')
  setting('http', 'port', 8000)
  setting('http', 'url', 'http://' + setting.http.host + ':' + setting.http.port)
  setting('http', 'secret', 'secret')
  setting('mysql', 'host', '127.0.0.1')
  setting('mysql', 'port', 3306)
  setting('mysql', 'database', 'ntf')
  setting('mysql', 'user', 'ntf')
  setting('mysql', 'password', 'ntf')
  setting('redis', 'host', '127.0.0.1')
  setting('redis', 'port', 6379)
  setting('redis', 'database', 0)

  app.configure(function() {
    if (setting.http.access_log)
      app.use(express.logger())
    app.use(express['static'](setting.project.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('jsonp callback', true)
    app.register('.js', swig)
    app.register('.html', swig)
    app.set('view engine', 'html')
    app.set('views', setting.project.template_path)
    app.set('view options', { layout: false })
  })

  shared.setup(setting)
  shared.io = io.listen(app)

  app.configure(setting.env.dev, function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
    swig.init({ root: setting.project.template_path, allowErrors: true, filters: utils.filters })
  })

  app.configure(setting.env.prod, function() {
    app.use(express.errorHandler())
    shared.io.set('log level', 1)
    swig.init({ root: setting.project.template_path, allowErrors: false, cache: true, filters: utils.filters })
  })

  routes.setup(app)

  return app
}

exports.run = function() {
  exports.createServer().listen(setting.http.port)
}
