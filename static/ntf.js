var api = null;

var setTitle = function() {
  var args = Array.prototype.slice.call(arguments);
  args.push('ntf');
  $('title').text(args.join(' - '));
}

var app = $.sammy('#main', function() {
  this.use('Mustache', 'html');

  this.get('#/', function(ctx) {
    setTitle();
    ctx.partial('templates/index.html');
  });

  this.get('#/suite', function(ctx) {
    setTitle('Suite');
    api.suiteList(function(err, result) {
      ctx.suite = result;
      ctx.partial('templates/suite_index.html');
    });
  });

  this.get('#/suite/:suite_name', function(ctx) {
    var suite_name = ctx.params.suite_name;
    setTitle(suite_name, 'Suite');

    async.parallel({
      suite: function(cb) { api.suiteList({ suite_name: suite_name }, cb) },
      suite_result: function(cb) { api.suiteResultList({ suite_name: suite_name }, cb) }
    }, function(err, data) {
      if (!data.suite.length) return this.notFound();
      ctx.suite = data.suite;
      ctx.suite_result = data.suite_result;
      console.log(data.suite_result)
      ctx.partial('templates/suite_detail.html');
    });
  });

  this.notFound = function(verb, path) {
    setTitle('Not Found');
    $('#main').html('Page not found.');
  };

});

$(document).ready(function() {
  DNode.connect(function(conn) {
    api = conn;
    app.run('#/');
  })
})
