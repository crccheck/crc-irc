var http = require('http'),
    net = require('net'),
    nstatic = require('node-static'),
    io = require('socket.io');

// web and static media server
var file = new(nstatic.Server)('./static');
server = http.createServer(function(req, res){
  req.addListener('end', function(){
    file.serve(req, res);
  });
});
server.listen(6464);

// irc connection
var irc = {
  // io buffer to hold incomplete sentences
  'buffer': '',
  // send raw data to the irc server
  'raw': function(data){
    this.socket.write(data + "\n", 'ascii', function(){
      console.log(">> ", data);
    });
  },
  // open a connection using options
  'connect': function(options){
    irc.socket.connect(options.port, options.host);
    irc.socket.on('connect', function(){
      irc.raw('NICK ' + options.nick);
      // TODO figure out this syntax
      irc.raw('USER ' + options.nick + " 0 * :" + options.name);
      if (options.pass) {
        irc.raw('PASS ' + options.pass);
      }
    });
  }
};

// assume only one client
var socketClient;

// socket.io
var socket = io.listen(server);
socket.on('connection', function(client){
  socketClient = client;
  client.on('message', function(message){
    if (message.action == "connect") {
      irc.connect(message);
    } else if (message.action == "raw"){
      irc.raw(message.message);
    }
    client.send(message); console.log("got a message", message);
  });
  client.on('disconnect', function(){
    console.log("bye");
    irc.socket.end();
    irc.socket.destroy();
  });
});


// main
irc.socket = new net.Socket();
irc.socket.setEncoding('ascii');
irc.socket.setNoDelay();
irc.socket.on('data', function(data){
  if (!socketClient){
    return;
  }
  var match = data.match(/^PING :(.+)\s*$/);
  if (match){
    irc.raw('PONG :' + match[1]);
    //return;
  }
  this.buffer += data;
  if (/\r\n$/.test(data)) {
    socketClient.send(this.buffer);
    console.log("<<<<<<<<<<<");
    console.log(this.buffer);
    console.log(">>>>>>>>>>>");
    this.buffer = '';
  }
});
