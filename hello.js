var http = require('http'),
    net = require('net'),
    static = require('node-static'),
    io = require('socket.io');

var file = new(static.Server)('./static');

// web and static media server
server = http.createServer(function(req, res){
  req.addListener('end', function(){
    file.serve(req, res);
  });
});
server.listen(6464);

// assume only one client
var socketClient;
// socket.io
var socket = io.listen(server);
socket.on('connection', function(client){
  socketClient = client;
  // new client is here!
  client.on('message', function(message){
    if (message.action == "connect") {
      connect(message);
    }
    client.send(message); console.log("got a message", message);
  });
  client.on('disconnect', function(){
    console.log("bye");
    irc.socket.end();
    irc.socket.destroy();
  })
});

var irc = {
  'buffer': '', // hold incomplete strings
  'raw': function(data){
    this.socket.write(data + "\n", 'ascii', function(){
      console.log(">> ", data);
    });
  }
};

irc.socket = new net.Socket();
irc.socket.setEncoding('ascii');
irc.socket.setNoDelay();
irc.socket.on('data', function(data){
  if (!socketClient){
    return;
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

function connect(options){
  irc.socket.connect(options.port, options.host);
  irc.socket.on('connect', function(){
    irc.raw('NICK ' + options.nick);
    irc.raw('USER ' + options.nick + " 0 * :test client");
    if (options.pass) {
      irc.raw('PASS ' + options.pass);
    }
  });
}
