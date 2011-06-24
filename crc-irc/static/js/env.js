// Environment module
//
// Keep track of the IRC environment. Who you are, what channels you're in,
// what nicks you know, etc.

function IRCSession(){
  // information about the server
  this.chantypes = '#';  // TODO read from raw 005
  this.chanmodes = 'eIbq,k,flj,CFLMPQcgimnprstz'; // TODO read from raw 005
  this.chanlimit = 120; // TODO read from raw 005
  this.prefix = '(ov)@+';  // TODO read from raw 005
  this.network = 'unknown network'; // TODO
  this.server = ''; // TODO

  // information about your channels
  this.channels = {};
  this.addChannel = function(chan){
    this.channels[chan.name] = chan;
  };
  this.getChannelByName = function(name){
    var chan = this.channels[Channel.cleanName(name)];
    if (chan){
      return chan;
    } else {
      //console.error("missing channel name", name, this.channels);
      return false;
    }
  };

  // information about users
  this.users = {};
  this.addUser = function(user){
    this.users[user.address] = user;
  };
  // other stuff

  // send message to node.js to connect to a server
  // options = {action: "connect", host: String, port: Int, nick: String, pass: String}
  this.connect = function(options){
    socket.send(options);
  };

  // throw away previous state
  this.reset = function(){
    this.channels = {};
    this.users = {};
  }
}

var ENV = new IRCSession();
