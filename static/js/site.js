$(document).ready(function() {
  ws.onmessage = function(evt) {
     $('#chat').val($('#chat').val() + evt.data + '\n');
  };
  $('#chatform').submit(function() {
     ws.send($('#message').val());
     $('#message').val("");
     return false;
  });
});

