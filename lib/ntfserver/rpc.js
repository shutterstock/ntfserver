var api = require('./api')
  , dnode = require('dnode')

var dnodeInterface = function() {
  this.suiteList = api.suiteList
  this.suiteResultList = api.suiteResultList
}

exports.setup = function(app) {
  dnode(dnodeInterface).listen(app)
}
