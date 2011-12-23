var global = require('./global')
  , socketio = require('socket.io')

module.exports = function(app) {
  var io = app.io = socketio.listen(app)

  app.configure('prod', 'production', function() {
    io.set('log level', 1)
  })

  io.sockets.on('connection', function (socket) {
    global.events.on('test', function(data) {
      socket.emit('test', data)
    })
  })
}
