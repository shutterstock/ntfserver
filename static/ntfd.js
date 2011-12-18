function handleTest(app, data) {
  var row = $('<tr/>');

  row.attr('name', 'test-' + data.name);
  row.attr('class', 'box ' + (data.failures > 0 ? 'failure' : 'success') + '-box');

  var link = $('<a target="_blank"/>');
  link.attr('href', '/test/' + data.name);
  link.text(data.name);

  row.append($('<td/>').append(link));
  row.append($('<td/>').text(data.duration));
  row.append($('<td/>').text(data.passes));
  row.append($('<td/>').text(data.failures));

  $(app.dom.events + ' tr[name=test-' + data.name + ']').remove();
  $(app.dom.events).prepend(row);
}

function setupSocket(app) {
  var socket = app.socket = io.connect();

  socket.on('test', function(data) { handleTest(app, data); } );

  return app;
}

function main() {
  var app = {};

  app.dom = { events: '#events tbody' };

  app = setupSocket(app);

  return app;
}
