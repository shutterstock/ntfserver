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

  this.get('#/agent', function(ctx) {
    setTitle('Agent');
    api.getAgentList(function(err, result) {
      ctx.agent = result;
      ctx.partial('templates/agent_index.html');
    });
  });

  this.get('#/agent/:agent_name', function(ctx) {
    var agent_name = ctx.params.agent_name;
    setTitle(agent_name, 'Agent');

    api.getAgentList({ agent_name: agent_name }, function(err, result) {
      ctx.agent = result;
      ctx.partial('templates/agent_detail.html');
    })
  })

  this.get('#/suite', function(ctx) {
    setTitle('Suite');
    api.getSuiteList(function(err, result) {
      ctx.suite = result;
      ctx.partial('templates/suite_index.html');
    });
  });

  this.get('#/suite/:suite_name', function(ctx) {
    var suite_name = ctx.params.suite_name;
    setTitle(suite_name, 'Suite');

    async.parallel({
      suite: function(cb) {
        api.getSuiteList({ suite_name: suite_name }, cb);
      },
      suite_result: function(cb) {
        api.getSuiteResultList({ suite_name: suite_name, limit: 5 }, cb);
      }
    }, function(err, data) {
      if (!data.suite.length) return this.notFound();
      ctx.suite = data.suite;
      ctx.suite_result = data.suite_result;
      ctx.partial('templates/suite_detail.html');
    });
  });

  this.get('#/suite/:suite_name/result', function(ctx) {
    var suite_name = ctx.params.suite_name;
    setTitle(suite_name, 'Suite');

    async.parallel({
      suite: function(cb) {
        api.getSuiteList({ suite_name: suite_name }, cb);
      },
      suite_result: function(cb) {
        api.getSuiteResultList({ suite_name: suite_name, }, cb);
      }
    }, function(err, data) {
      if (!data.suite.length) return this.notFound();
      ctx.suite = data.suite;
      ctx.suite_result = data.suite_result;
      ctx.partial('templates/suite_result.html');
    });
  });

  this.get('#/suite/:suite_name/result/:suite_result_id', function(ctx) {
    var suite_name = ctx.params.suite_name;
    var suite_result_id = parseInt(ctx.params.suite_result_id);
    setTitle('Result ' + suite_result_id, suite_name, 'Suite');

    async.parallel({
      suite: function(cb) { api.getSuiteList({ suite_name: suite_name }, cb) },
      suite_result: function(cb) {
        api.getSuiteResultList({
          suite_name: suite_name,
          suite_result_id: suite_result_id
        }, cb);
      }
    }, function(err, data) {
      if (!data.suite.length) return this.notFound();
      ctx.suite = data.suite;
      ctx.suite_result = data.suite_result;
      ctx.partial('templates/suite_result_detail.html');
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
