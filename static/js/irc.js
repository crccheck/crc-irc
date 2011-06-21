// CONFIGURATION
var COMMAND_PREFIX = '/';
var NICK = 'kurol';

// String.split, but preserves all the characters
String.prototype.psplit = function(sep, limit){
  var tokens = this.split(sep);
  var n = tokens.length;
  if (limit < n){
    var partial = tokens.slice(limit - 1);
    tokens.splice(limit - 1, n - limit + 1, partial.join(sep));
  }
  return tokens;
}

var socket = new io.Socket("");
socket.connect();
socket.on('connect', function(){ });
socket.on('disconnect', function(){ });
function _onmessage(data){
  if (typeof data == "string"){
    data = data.split("\r\n");
    data.forEach(function(line){
      if (line.length && line[0] == ":"){
          var tokens = line.substr(1).psplit(":", 2);
          if (tokens.length < 2) {
            console.log("TOO SHORT:" , line);
            return;
          }
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
socket.on('message', _onmessage);

function dump(){
   document.getElementById('chat').innerHTML += this.line + "\n";
}

function dispatch(data){
  var dispatcher = {
    "JOIN": function(){
      var chan = ENV.getChannelByName(this.args);
      if (!chan) {
        chan = new Channel(this.args);
        ENV.addChannel(chan);
      }
      // add user to IAL and channel user list
    },
    "ping": function(){
      var target = this.target;
      var message = this.args[0];
      // ignore
    },
    "PRIVMSG": function(){
      var sender = new User(this.source);
      var chan = $.trim(this.target);
      var message = this.args;
      if (_chan = ENV.getChannelByName(chan)){
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
    "462": dump,
  };
  var fun;
  if (fun = dispatcher[data.type]) {
    fun.call(data);
  } else {
    console.log(data.type, "source:", data.source, "target:", data.target, "args:", data.args);
  }
}


// translates mIRC style command to start a connection
// /server host[:port] [pass]
function server(tokens){
  if (!tokens.length)
    return;
  var host_port = tokens[0].split(':')
  var host = host_port[0]
  var port = host_port[1] || "6667"
  var pass = tokens[1] || ''
  return {action:"connect", host:host, port:port, nick:NICK, pass:pass}
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
      socket.send(server(tokens));
      break;
  }
}

