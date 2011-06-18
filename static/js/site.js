$(document).ready(function() {
  var ws = new WebSocket('ws://localhost:8888/ws');
  //var ws = new WebSocket('ws://r0xr-vm.local:8888/ws');
  ws.onmessage = function(evt) {
     $('#chat').val($('#chat').val() + evt.data + '\n');
  };
  $('#chatform').submit(function() {
     ws.send($('#message').val());
     $('#message').val("");
     return false;
  });
});

