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
    '<aside></aside><ol class="content"></ol>' +
    '<footer><input type="text" placeholder="Enter a message"></footer>').appendTo(document.body);
  this.$topic = this.$elem.find('h2');
  this.$content = this.$elem.find('ol');
  this.$input = this.$elem.find('input:first').change(function(){
    self.pubmsg({sender: 'me', message: this.value});
    socket.send({action:'raw', message:"PRIVMSG " + self.channel + " " + this.value});
    this.value = '';
  });

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

// setTopic(String)
Channel.prototype.setTopic = function(s){
  this.topic = s;
  this.$topic.text(s);
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
