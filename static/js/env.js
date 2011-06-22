// Environment module
//
// Keep track of the IRC environment. Who you are, what channels you're in,
// what nicks you know, etc.

var ENV = {
  // information about the server
  'chantypes': '#',  // TODO read from raw 005
  'chanmodes': 'eIbq,k,flj,CFLMPQcgimnprstz', // TODO read from raw 005
  'chanlimit': 120, // TODO read from raw 005
  'prefix': '(ov)@+',  // TODO read from raw 005
  'network': 'unknown network', // TODO
  'server': '', // TODO
  // information about your channels
  'channels': {},
  'addChannel': function(chan){
    this.channels[chan.name] = chan;
  },
  'cleanChannelName': function(s){
    //FIXME this is the same as Channel.cleanName
    return s.substr(1).toLowerCase();
  },
  'getChannelByName': function(name){
    var chan = this.channels[this.cleanChannelName(name)];
    if (chan){
      return chan;
    } else {
      //console.error("missing channel name", name, this.channels);
      return false;
    }
  },
  // information about users
  'users': {},
  'addUser': function(user){
    this.users[user.address] = user;
  },
  // other stuff

  // send message to node.js to connect to a server
  // options = {action: "connect", host: String, port: Int, nick: String, pass: String}
  'connect': function(options){
    socket.send(options);
  }
};
