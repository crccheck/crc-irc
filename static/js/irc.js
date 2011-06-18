// CONFIGURATION
var COMMAND_PREFIX = '/';
var NICK = 'kurol';

var ws = new WebSocket('ws://localhost:8888/ws');

// translates:
// /server host[:port] [pass]
// into:
// connect host port pass
function server(tokens){
  if (!tokens.length)
    return;
  var host_port = tokens[0].split(':')
  var host = host_port[0]
  var port = host_port[1] || "6667"
  var pass = tokens[1] || ''
  return ["connect", host, port, NICK, pass].join(" ");
}

// interpret a line
function send(line){
  if (!line)
    return;
  var tokens = line.split(/\s+/);
  if (tokens.length < 2)
    return;
  var command = tokens.shift()
  if (command[0] != COMMAND_PREFIX)
    return;
  var command = command.substring(1);

  // if (tokens[1] == COMMAND_PREFIX), process the tokens. evaluates and replace the variables
  switch (command){
    case 'server':
      console.log(tokens);
      ws.send(server(tokens));
      break;
  }
}

