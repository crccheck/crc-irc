// CONFIGURATION
var COMMAND_PREFIX = '/';
var NICK = 'kurol';

var ws = new WebSocket('ws://localhost:8888/ws');

function _onmessage(e){
  if (e.data) {
    var data = JSON.parse(e.data);
    if (data.type) {
      // if data is an IRC Event
      dispatch(data);
    }
  }
}

var channels = [];
var windows = {};

function dispatch(data){
  var dispatcher = {
    "currenttopic": function(){
      var chanName = this.arguments[0];
      var topic = this.arguments[1];
      ENV.getChannelByName(chanName).setTopic(topic);
    },
    "join": function(){
      var chan = ENV.getChannelByName(this.target);
      if (!chan) {
        chan = new Channel(this.target)
        ENV.addChannel(chan);
      }
      // add user to IAL and channel user list
    },
    "ping": function(){
      var target = this.target;
      var message = this.arguments[0];
      // ignore
    },
    "pubmsg": function(){
      var sender = new User(this.source);
      var chan = this.target;
      var message = this.arguments[0];
      ENV.getChannelByName(chan).pubmsg({sender: sender, message: message});
    },
    "quit": function(){
      var sender = new User(this.source);
      var message = this.arguments[0];
      //ENV.quit(sender, message);
    }
  };
  var fun;
  if (fun = dispatcher[data.type]) {
    fun.call(data);
  } else {
    console.log(data.type, data.source, data.target, data.arguments);
  }
}

ws.onmessage = _onmessage;

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

// interpret a line from the input and send to IRC
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
      ws.send(server(tokens));
      break;
  }
}

// ping the server since I haven't figured out how to do async push in tornado
function ping(){
  ws.send('')
}

