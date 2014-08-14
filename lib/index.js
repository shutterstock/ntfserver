var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , io = require('socket.io')
  , setting = require('setting')
  , swig = require('swig')
  , routes = require('./routes')
  , shared = require('./shared')
  , utils = require('./utils')
  , heapdump = require('heapdump')

var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var errorHandler   = require('errorhandler');
var morgan         = require('morgan'); //log handler

var rootPath = path.resolve(path.join(__dirname, '..'))
heapdump.writeSnapshot();

exports.createServer = function() {
  var app = express() 

  process.chdir(rootPath)

  setting('project', 'root_path', path.resolve(path.join(__dirname, '..')))
  setting('project', 'static_path', path.join(setting.project.root_path, 'static'))
  setting('project', 'template_path', path.join(setting.project.root_path, 'templates'))
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
    
  app.use(morgan('combined'))
  app.use(express.static(setting.project.static_path))
  app.use(cookieParser())
  app.use(bodyParser())
  app.set('jsonp callback', true)
  app.engine('.js', swig.renderFile)
  app.engine('.html', swig.renderFile)
  app.set('view engine', 'html')
  app.set('views', setting.project.template_path)
  app.set('view options', { layout: false })

  shared.setup(setting)

  var env = process.env.NODE_ENV || 'development';
  if('development' == env) {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }))
    swig.setDefaults({ loader: swig.loaders.fs(setting.project.template_path), allowErrors: true })
  } else {
    app.use(errorHandler())
    swig.setDefaults({ loader: swig.loaders.fs(setting.project.template_path), allowErrors: false, cache: 'memory' })
  }

  routes.setup(app)

  return app
}

exports.run = function() {
  server = exports.createServer().listen(setting.http.port)
  shared.io = io.listen(server)
}
