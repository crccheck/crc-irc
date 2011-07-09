// Environment module
//
// Keep track of the IRC environment. Who you are, what channels you're in,
// what nicks you know, etc.

function IRCSession(){
  // information about me
  this.me = '';

  // information about the server
  this.chantypes = '#';  // TODO read from raw 005
  this.chanmodes = 'eIbq,k,flj,CFLMPQcgimnprstz'; // TODO read from raw 005
  this.chanlimit = 120; // TODO read from raw 005
  this.prefix = '(ov)@+';  // TODO read from raw 005
  this.network = 'unknown network'; // TODO
  this.server = ''; // TODO

  // information about your windows
  this.windows = {};
  this.addWindow = function(win){
    this.windows[win.name] = win;
  };

  // information about users
  this.users = {};
  this.addUser = function(user){
    this.users[user.address] = user;
  };

  // throw away previous state
  this.reset = function(){
    this.windows = {};
    this.users = {};
  };
}

IRCSession.prototype.getWindowByName = function(name){
  var win = this.windows[Window.cleanName(name)];
  if (win){
    return win;
  }
  return false;
};

IRCSession.prototype.getChannelByName = function(name){
  var win = this.windows[Window.cleanName(name)];
  if (win && win.type == "channel"){
    return win;
  }
  return false;
};

IRCSession.prototype.getAllWindows = function(){
  // chrome doesn't have for each ... in :(
  var x, list = [];
  for (x in this.windows) {
    if (this.windows.hasOwnProperty(x)){
      list.push(this.windows[x]);
    }
  }
  return list;
};

IRCSession.prototype.getAllChannels = function(){
  // chrome doesn't have for each ... in :(
  var x, list = [];
  for (x in this.windows) {
    if (this.windows.hasOwnProperty(x) && this.windows[x].type == 'channel'){
      list.push(this.windows[x]);
    }
  }
  return list;
};

var ENV = new IRCSession();
