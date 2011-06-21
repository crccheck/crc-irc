function Channel(name){
  if (!name) {
    return;
  }
  this.channel = name;
  this.name = this.cleanName(name);
  if (document.getElementById(this.name)){
    return;
  }
  this.$elem = $('<section id="' + this.name  +'" class="channel">'
    + '<header><h1 class="channel-name">'+name+'</h1><h2 class="topic"></h2></header>'
    + '<aside></aside><ol class="content"></ol>'
    + '<footer></footer>').appendTo(document.body);
  this.$topic = this.$elem.find('h2');
  this.$content = this.$elem.find('ol');
}

Channel.prototype.cleanName = function(s){
  // strip channel prefix and force lower case
  return s.substr(1).toLowerCase();
};

Channel.prototype.pubmsg = function(data){
  var line = $('<li class="pubmsg"/>').html('<time></time>'
    + '<span class="nick">' + data.sender + '</span>'
    + '<span class="message"></span>');
  line.children('.message').text(data.message);
  line.appendTo(this.$content);
  if (this.$content && this.$content.length) {
    this.$content[0].scrollTop = this.$content[0].scrollHeight;
  } else {
    console.log("missing $content", this);
  }
  //self.$content.append(line);
};

Channel.prototype.setTopic = function(s){
  this.topic = s;
  this.$topic.text(s);
};

Channel.prototype.trigger = function(eventName, args){
  if (this.$elem){
    this.$elem.trigger(eventName, args);
  }
};

Channel.prototype.toString = function(){
  return this.channel;
};

Channel.isChannel = function(s){
  // return boolean if the string is a channel
  return s[0] == '#';
};