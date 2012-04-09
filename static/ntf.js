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
