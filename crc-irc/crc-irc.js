var net = require('net'),
    io = require('socket.io');


// irc connection
function Connection(socketClient) {
  var self = this;
  this.buffer = '';
  this.client = socketClient;
  this.client.on('message', function(message){
    if (message.action == "connect") {
      self.connect(message);
    } else if (message.action == "raw"){
      self.raw(message.message);
    }
    //this.client.send(message); console.log("got a message", message);
  });
  this.client.on('disconnect', function(){
    self.destroy();
  });

  this.socket = new net.Socket();
  this.socket.setEncoding('ascii');
  this.socket.setNoDelay();
  this.socket.on('data', function(data){
    var match = data.match(/^PING :(.+)\s*$/);
    if (match){
      self.raw('PONG :' + match[1]);
      //return;
    }
    self.buffer += data;
    if (/\r\n$/.test(data)) {
      self.client.send(self.buffer);
      console.log("<<<<<<<<<<<");
      console.log(self.buffer);
      console.log(">>>>>>>>>>>");
      self.buffer = '';
    }
  });
}

Connection.prototype.raw = function(data){
  this.socket.write(data + "\n", 'ascii', function(){
    console.log(">> ", data);
  });
};

Connection.prototype.connect = function(options){
  var self = this;
  this.connectOptions = options;
  this.socket.connect(options.port, options.host);
  this.socket.on('connect', function(){
    self.raw('NICK ' + options.nick);
    // TODO figure out this syntax
    self.raw('USER ' + options.nick + " 0 * :" + options.name);
    if (options.pass) {
      self.raw('PASS ' + options.pass);
    }
  });
};

Connection.prototype.destroy = function(){
  console.log("bye");
  this.socket.end();
  this.socket.destroy();
  //TODO destroy self
};


function main(httpServer){
  var socket = io.listen(httpServer);
  socket.on('connection', function(client){
    new Connection(client);
  });
}


exports.start = main;
