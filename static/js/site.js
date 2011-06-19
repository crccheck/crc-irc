$(document).ready(function() {
  $('#chatform').submit(function() {
     ws.send($('#message').val());
     $('#message').val("");
     return false;
  });
  // poll the server since I haven't figured out how to do push yet
  setInterval(ping, 2000);
});

