function createEvents() {
  return io.connect('/events');
}

function handleStatus() {
  setInterval(function() {
    $('.age').each(function() {
      var el = $(this);
      var d = new Date(parseInt(el.attr('time')));
      el.text(shared.filters.age(d));
    });
  });
  var render = swig.compile(shared.template['status_result.html']);
  var events = createEvents();
  events.on('suite', function(data) {
    $('#status-event-' + data.suite.replace(/\./g, '-')).remove();
    data.time = new Date(data.time);
    var html = render({ result: data });
    $('#status-' + (data.ok ? 'pass' : 'fail')).prepend(html);
  });
}

function main(load) {
  swig.init({ filters: shared.filters });
  if (load) load();
}

function reportTestDuration(id, url) {
  return new Rickshaw.Graph.JSONP({
    element: document.querySelector(id),
    dataURL: url,
    width: 800,
    height: 300,
    interpolation: 'step-after',
    onData: function(result) {
      return [{
        name: 'Duration (ms)',
        color: 'steelblue',
        data: result.data.map(function(d) { return { x: parseInt(d.time / 1000), y: d.duration }; })
      }];
    },
    onComplete: function(transport) {
      var graph = transport.graph;
      var detail = new Rickshaw.Graph.HoverDetail({
        graph: graph,
        xFormatter: function(x) {
          var d = new Date(x * 1000).toLocaleString();
          return d.slice(0, 24) + d.slice(33);
        }
      });
    }
  });
}
