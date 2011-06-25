// Channel module

function Channel(name){
  if (!name) {
    return;
  }
  var self = this;
  this.channel = name;
  this.name = Channel.cleanName(name);
  if (document.getElementById(this.name)){
    return;
  }
  this.$elem = $('<section id="' + this.name  +'" class="channel shadow">' +
    '<header><h1 class="channel-name">'+name+'</h1><h2 class="topic"></h2></header>' +
    '<aside><ul></ul></aside><ol class="content"></ol>' +
    '<footer><input type="text" placeholder="Enter a message"></footer>').appendTo(CANVAS);
  this.$topic = this.$elem.find('h2');
  this.$content = this.$elem.find('ol');
  this.$input = this.$elem.find('input:first').change(function(){
    self.pubmsg({sender: 'me', message: this.value});
    socket.send({action:'raw', message:"PRIVMSG " + self.channel + " " + this.value});
    this.value = '';
  });
  this.nicklist = [];
  this.$nicklist = this.$elem.find('aside > ul');

  ENV.addChannel(this);
}

// ------------------------ API -----------------------

// pubmsg(data)
// data -> {sender: User,
//          message: String}
Channel.prototype.pubmsg = function(data){
  var line = $('<li class="pubmsg"/>').html('<time></time>' +
    '<span class="nick">' + data.sender + '</span>' +
    '<span class="message"></span>');
  line.children('.message').text(data.message);
  line.appendTo(this.$content);
  if (this.$content && this.$content.length) {
    this.$content[0].scrollTop = this.$content[0].scrollHeight;
  } else {
    console.log("missing $content", this);
  }
};

// retrieve the i-th message in reverse chronological order, 0-indexed
Channel.prototype.get_message = function(i){
  var collection = this.$elem.children('ol').children();
  var n = collection.length;
  if (i <= n){
    var line = collection.eq(n - i - 1);
    return {"nick": line.find('.nick').text(),
            "message": line.find('.message').text()};
  }
};

// setTopic(String)
Channel.prototype.setTopic = function(s){
  this.topic = s;
  this.$topic.text(s);
};

Channel.prototype.hasNick = function(nick){
  nick = User.cleanNick(nick);
  return this.nicklist.indexOf(nick) !== -1;
};

Channel.prototype.addNick = function(nick){
  nick = User.cleanNick(nick);
  if (!this.hasNick(nick)){
    this.nicklist.push(nick);
    this.$nicklist.append($('<li>' + nick + '</li>'));
  }
};

Channel.prototype.addNicks = function(nickArray){
  var self = this;
  nickArray.forEach(function(nick){
    self.addNick(nick);
  });
};

// -------------------- HELPERS --------------------

// cleanName(String)
// @return a standardized version of the channel name
Channel.cleanName = function(s){
  // strip channel prefix and force lower case
  return s.substr(1).toLowerCase();
};

// isChannel(String)
// @return a boolean if a string is channel. If it isn't we assume it's a nick.
Channel.isChannel = function(s){
  // return boolean if the string is a channel
  // TODO check ENV.chanmodes
  return s[0] == '#';
};

// @return the string representation of the channel
Channel.prototype.toString = function(){
  return this.channel;
};

// @return a serializable version of the channel
Channel.prototype.toObject = function(){

};
