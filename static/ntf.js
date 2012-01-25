var handleTest = function(app, data) {
  var id = 'test-' + data.name;
  var row = $('<tr/>');

  row.attr('name', 'test-' + data.name);
  row.attr('class', 'box ' + (data.failures > 0 ? 'failure' : 'success') + '-box');

  var link = $('<a target="_blank"/>');
  link.attr('href', '/test/' + data.name + '/history?limit=50');
  link.text(data.name);

  row.append($('<td/>').append(link));
  row.append($('<td/>').text(data.duration));
  row.append($('<td/>').text(data.passes));
  row.append($('<td/>').text(data.failures));

  $(app.dom.events + ' tr[name="' + id + '"]').remove();
  $(app.dom.events).prepend(row);
}

var setupSocket = function(app) {
  var socket = app.socket = io.connect();

  socket.emit('test', true);

  socket.on('test', function(data) {
    handleTest(app, data);
  });

  return app;
}

var conRandom = function(str) {
  var num = 0;
  for (var i in str) {
    num += str.charCodeAt(i);
  }
  return (num % 100) / 100;
}

var createDurationSeries = function(tests) {
  var passColor = d3.interpolateRgb("#63C76F", "#00630C");
  var failColor = d3.interpolateRgb("#FA7881", "#870009");

  var seriesData = {}

  for (var t in tests) {
    var test = tests[t]

    for (var r in test.results) {
      var result = test.results[r];

      var passId = r + ' - ok';
      var failId = r + ' - fail';

      var passSeries = seriesData[passId];
      var failSeries = seriesData[failId];

      if (passSeries === undefined) {
        passSeries = seriesData[passId] = {
          name: passId,
          color: passColor(conRandom(r)),
          data: []
        }
      }
      if (failSeries === undefined) {
        failSeries = seriesData[failId] = {
          name: failId,
          color: failColor(conRandom(r)),
          data: []
        }
      }

      passSeries.data.push({
        x: test.timestamp,
        y: result.ok ? result.duration : 0
      });
      failSeries.data.push({
        x: test.timestamp,
        y: result.ok ? 0 : result.duration
      });
    }
  }

  var series = [];

  for (var id in seriesData) {
    series.push(seriesData[id]);
  }

  return series;
};

var createDurationGraph = function(data, id) {
  var series = createDurationSeries(data);

  if (series.length > 5) {
    try {
      var graph = new Rickshaw.Graph({
        element: document.getElementById('durationGraph'),
        width: '100%',
        height: 400,
        renderer: 'bar',
        interpolation: 'step-after',
        series: series
      });
      graph.render();
    } catch(err) {
      $('#durationGraph').remove();
      throw err;
    }
  }
}

var routeIndex = function() {
  var app = {};

  app.dom = { events: '#events tbody' };

  app = setupSocket(app);

  return app;
}

var routeTestHistory = function() {
  var app = {};

  $.ajax({
    url: document.location.href,
    dataType: 'json',
    success: function(data) {
      createDurationGraph(data);
    }
  });

  return app;
}
