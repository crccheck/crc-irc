// User module

function User(address){
  var matches = address.match(/(.+)!(.+)@(.+)/);
  this.address = address;
  this.nick = matches[1];
  this.identd = matches[2];
  this.host = matches[3];

  ENV.addUser(this);
}

// @return nick without any mode prefixes
User.cleanNick = function(nick){
  return nick.replace(/^[@+]/, '');
};

// @return list of channels a user is in
User.prototype.getChannels = function(){
  var self = this;
  return ENV.getAllChannels().filter(function(x){ return x.hasNick(self.nick); });
};

// @return the string representation of the user
User.prototype.toString = function(){
  return this.nick;
};
