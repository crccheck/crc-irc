// CONFIGURATION
var COMMAND_PREFIX = '/';
var CANVAS = document.getElementById("pane-main");  // where the app drops elements, this is set to an unattached DOM node for testing
var SCROLLBACK = 1000;  //how many lines to keep in the scrollback

function dispatch(data){
  var dispatcher = RFC1459;
  var fun = dispatcher[data.type];
  if (fun) {
    fun.call(data);
  } else {
    notimplemented.call(data);
  }
}

function parse_line(line){
  var tokens = line.substr(1).psplit(" :", 2);
  var token_data = tokens[0].psplit(" ", 3);
  var sender = token_data[0];
  var type = token_data[1];
  var target = token_data[2];
  return {line: line,
          source: sender,
          type: type,
          target: target,
          args: tokens[1]};
}

// separate each chunk into individual messages and send them to be dispatched
function parse_chunk(lines){
  if (typeof lines == "string"){
    lines.split("\r\n").forEach(function(line){
      if (line.length && line[0] == ":"){
        dispatch(parse_line(line));
      }
    });
  }
}


// kind of a mish mash of stuff... not very consistent
var commands = {
  send: function(data){
    socket.json.send(data);
  },

  privmsg: function(target, message){
    var data = {action:'raw', message:"PRIVMSG " + target + " " + message};
    this.send(data);
  },

  // translates mIRC style command to start a connection
  // /server host[:port] [pass]
  server: function(tokens){
    if (!tokens.length)
      return;
    var host_port = tokens[0].split(':');
    var host = host_port[0];
    var port = host_port[1] || "6667";
    var pass = tokens[1] || '';
    var data = {action:"connect", host:host, port:port, nick:$('#connect-nick').val(), pass:pass};
    this.send(data);
  }
};


if (typeof io !== "undefined"){
  var socket = io.connect();
  socket.on('connect', function(){
    socket.on('noise', parse_chunk);
    socket.on('disconnect', function(){ });
  });
} else {
  // stub socket for testing
  var socket = {'send': function(s){ console.log("socket.json.send(" + JSON.stringify(s) + ")"); }};
  CANVAS = document.getElementById('qunit-fixture');
}

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
  command = command.substr(1);

  // if (tokens[1] == COMMAND_PREFIX), process the tokens. evaluates and replace the variables
  switch (command){
    case 'server':
      commands.server(tokens);
      break;
    case 'xyzzy':
      // not implemented yet. here to keep jshint from complaining
      break;
    default:
      console.log('send', line.substr(1));
      socket.json.send({action:'raw', message: line.substr(1)});
      break;
  }
}


$(document).ready(function(){
  ENV.statusWindow = new Channel();  // make status window, delay to make sure the plugin is loaded
});
