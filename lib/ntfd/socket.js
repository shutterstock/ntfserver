var global = require('./global')
  , socketio = require('socket.io')

module.exports = function(app) {
  var io = app.io = socketio.listen(app)

  app.configure('prod', 'production', function() {
    io.set('log level', 1)
  })

  io.sockets.on('connection', function (socket) {
    var testSubscription = null

    socket.on('test', function(subscribe) {
      if (testSubscription) {
        global.events.removeListener('test', testSubscription)
        testSubscription = null
      }

      if (subscribe) {
        testSubscription = function(test) {
          socket.emit('test', test)
        }
        global.events.on('test', testSubscription)
      }
    })
  })
}
