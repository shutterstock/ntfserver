function setupEvents() {
  window.app.io = io.connect('/events');
}

function handleStatus() {
  setupEvents();
  setInterval(function() {
    $('.age').each(function() {
      var el = $(this);
      var d = new Date(parseInt(el.attr('time')));
      el.text(window.shared.filters.age(d));
    });
  });
  var render = swig.compile(window.shared.template['status_result.html']);
  window.app.io.on('suite', function(data) {
    $('#status-event-' + data.suite.replace('.', '-')).remove();
    data.time = new Date(data.time);
    var html = render({ result: data });
    $('#status-' + (data.ok ? 'pass' : 'fail')).prepend(html);
  });
}

function main() {
  window.app = {};
  swig.init({ filters: window.shared.filters });
  switch (window.location.pathname) {
    case '/status':
      handleStatus();
      break;
  }
}

$(document).ready(function() {
  main();
});
