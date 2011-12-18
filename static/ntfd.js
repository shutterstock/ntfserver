var socket = io.connect();

socket.on('test', function (data) {
  var p = $('<p/>').text(JSON.stringify(data));
  $('#notifications').prepend(p);
});
