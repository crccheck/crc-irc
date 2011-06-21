$(document).ready(function() {
  $('#chatform').submit(function() {
     socket.send($('#message').val());
     $('#message').val("");
     return false;
  });
});

