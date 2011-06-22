// CONFIGURATION
var COMMAND_PREFIX = '/';

function dispatch(data){
  var dispatcher = {
    "JOIN": function(){
      var chan = ENV.getChannelByName(this.args);
      if (!chan) {
        chan = new Channel(this.args);
      }
      // add user to IAL and channel user list
    },
    "PRIVMSG": function(){
      var sender = new User(this.source);
      var chan = $.trim(this.target);
      var message = this.args;
      var _chan = ENV.getChannelByName(chan);
      if (_chan){
        _chan.pubmsg({sender: sender, message: message});
      }
    },
    "QUIT": function(){
      var sender = new User(this.source);
      var message = this.args;
      //ENV.quit(sender, message);
    },
    "332": function(){
      var chanName = this.target.split(' ')[1];
      var topic = this.args;
      ENV.getChannelByName(chanName).setTopic(topic);
    },
    "372": dump,
    "462": dump
  };
  var fun = dispatcher[data.type];
  if (fun) {
    fun.call(data);
  } else {
    console.log(data.type, "source: (" + data.source + ") target: (" + data.target + ") args:", data.args);
  }
}

// separate each chunk into individual messages and send them to be dispatched
function parse_chunk(lines){
  if (typeof lines == "string"){
    lines.split("\r\n").forEach(function(line){
      if (line.length && line[0] == ":"){
          var tokens = line.substr(1).psplit(" :", 2);
          var token_data = tokens[0].psplit(" ", 3);
          var sender = token_data[0];
          var type = token_data[1];
          var target = token_data[2];
          dispatch({line: line,
                    source: sender,
                    type: type,
                    target: target,
                    args: tokens[1]});
      }
    });
  }
}

var socket = new io.Socket("");
socket.connect();
socket.on('connect', function(){ });
socket.on('disconnect', function(){ });
socket.on('message', parse_chunk);


// translates mIRC style command to start a connection
// /server host[:port] [pass]
function server(tokens){
  if (!tokens.length)
    return;
  var host_port = tokens[0].split(':');
  var host = host_port[0];
  var port = host_port[1] || "6667";
  var pass = tokens[1] || '';
  return {action:"connect", host:host, port:port, nick:$('#connect-nick').val(), pass:pass};
}
$('#connect').submit(function(){
  var options = {
    action: "connect",
    host: $('#connect-host').val(),
    port: +($('#connect-port').val() || 6667),
    nick: $('#connect-nick').val(),
    pass: $('#connect-pass').val(),
    name: $('#connect-name').val(),
  };
  // TODO validate
  ENV.connect(options);
  //return false;
});

// interpret a line from the input and send to IRC
function send(line){
  if (!line)
    return;
  var tokens = line.split(/\s+/);
  if (tokens.length < 2)
    return;
  var command = tokens.shift();
  if (command[0] != COMMAND_PREFIX)
    return;
  command = command.substring(1);

  // if (tokens[1] == COMMAND_PREFIX), process the tokens. evaluates and replace the variables
  switch (command){
    case 'server':
      socket.send(server(tokens));
      break;
  }
}

$('#status form').submit(function(){
  var input = $(this).find('input:first');
  var message = input.val();
  input.val('');
  send(message);
  return false;
});
