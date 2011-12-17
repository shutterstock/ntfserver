var ntfd = require('./index')

var server = ntfd.createServer()

server.listen(server.config.http.port)
