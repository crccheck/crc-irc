$('#connect-form').submit(function(){
  var options = {
    action: "connect",
    host: $('#connect-host').val(),
    port: +($('#connect-port').val() || 6667),
    nick: $('#connect-nick').val(),
    pass: $('#connect-pass').val(),
    name: $('#connect-name').val()
  };
  // TODO validate
  ENV.connect(options);
  //return false;
});

$('form').submit(false);

loadPlugin('connections', true);
loadPlugin('channelbar', true);
loadPlugin('hilight', true);
loadPlugin('linkify');
