var express = require('express')
  , fs = require('fs')
  , global = require('./global')
  , periodic = require('./periodic')
  , routes = require('./routes')

exports.version = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'))['version'];

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

  defaultConfig('general', 'debug', false)
  defaultConfig('http', 'port', 8000)
  defaultConfig('http', 'secret', 'secret')
  defaultConfig('http', 'static_path', __dirname + '/../../static')
  defaultConfig('http', 'template_path', __dirname + '/../../templates')
  defaultConfig('redis', 'host', '127.0.0.1')
  defaultConfig('redis', 'port', 6379)
  defaultConfig('redis', 'database', 0)
  defaultConfig('test', 'timeout', 60)

  app.configure(function() {
    app.use(express.static(config.http.static_path))
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.set('views', config.http.template_path)
    app.set('view options', { jinjs_pre_compile: function (str) { return parse_pwilang(str) } })
    app.set('view options', { layout: false })
    app.register('.html', require('jinjs'))
  })

  app.configure('development', function() {
    config.general.debug = true
  })

  global.setup(config)
  periodic.run()

  app.use(express.errorHandler({
    dumpExceptions: config.general.debug,
    showStack: config.general.debug,
  }))

  routes(app)

  var io = global.io = require('socket.io').listen(app)

  io.sockets.on('connection', function (socket) {
    global.notification.on('test', function(data) {
      socket.broadcast.emit('test', data)
    })
  })

  return app
}
