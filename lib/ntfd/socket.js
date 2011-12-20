var global = require('./global')
  , socketio = require('socket.io')

module.exports = function(app) {
  var io = app.io = socketio.listen(app)

  if (!global.config.general.debug) io.set('log level', 1)

  io.sockets.on('connection', function (socket) {
    global.events.on('test', function(data) {
      socket.broadcast.emit('test', data)
    })
  })
}
