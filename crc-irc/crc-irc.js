var net = require('net');


// irc connection
function Connection(webSocket) {
  var self = this;
  this.buffer = '';
  this.ws = webSocket;
  this.ws.on('message', function(message){
    if (message.action == "connect") {
      self.connect(message);
    } else if (message.action == "raw"){
      self.raw(message.message);
    }
  });
  this.ws.on('disconnect', function(){
    self.destroy();
  });

  this.socket = new net.Socket();
  this.socket.setEncoding('ascii');
  this.socket.setNoDelay();
  this.socket.on('connect', function(){
    //PASS <password>
    var pass = self.connectOptions.pass;
    if (pass){
      self.raw('PASS ' + pass);
    }
    //NICK <nickname> [<hopcount>]
    self.raw('NICK ' + self.connectOptions.nick);
    //USER <username> <hostname> <servername> <realname>
    self.raw('USER ' + self.connectOptions.nick + " 0 * :" + self.connectOptions.name);
  });
  this.socket.on('data', function(data){
    var match = data.match(/^PING :(.+)\s*$/);
    if (match){
      self.raw('PONG :' + match[1]);
      //return;
    }
    self.buffer += data;
    if (/\r\n$/.test(data)) {
      self.ws.emit('noise', self.buffer);
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
  if (this.socketStatus) {
    this.quit();
    this.socketStatus = false;
  }
  this.socket.connect(options.port, options.host);
  this.socketStatus = options.host;
};

Connection.prototype.quit = function(){
  this.raw('QUIT');
  this.destroy();
};

Connection.prototype.destroy = function(){
  console.log("bye");
  this.socket.end();
  this.socket.destroy();
  //TODO destroy self
};


function main(httpServer){
  var io = require('socket.io').listen(httpServer);
  io.set('log level', 1);
  io.configure('production', function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.set('transports', [
      'websocket',
      'flashsocket',
      'htmlfile'
    ]);
  });
  io.configure ('development', function(){
    io.set('transports', ['websocket']);
  });
  io.sockets.on('connection', function(socket){
    new Connection(socket);
  });
}


exports.start = main;
