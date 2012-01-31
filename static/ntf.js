var app = $.sammy('#main', function() {
  this.use('Template');

  this.get('#/', function(ctx) {
    this.partial('templates/index.html');
  });

});

var dnode = function() {

  DNode.connect(function(remote) {
    remote.suiteList({}, function (err, result) {
      console.log(result);
    });
  });

};

$(document).ready(function() {
  app.run('#/');
})
