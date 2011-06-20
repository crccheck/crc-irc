function User(address){
  this.address = address;
  var matches = address.match(/(.+)!(.+)@(.+)/);
  this.nick = matches[1];
  this.identd = matches[2];
  this.host = matches[3];

  ENV.users[address] = this;
}

User.prototype.toString = function(){
  return this.nick;
};
