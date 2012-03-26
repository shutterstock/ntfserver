var api = require('./api')
  , dnode = require('dnode')

var dnodeInterface = function() {
  this.getAgentList = api.getAgentList
  this.getSuiteList = api.getSuiteList
  this.getSuiteResultList = api.getSuiteResultList
}

exports.setup = function(app) {
  dnode(dnodeInterface).listen(app)
}
