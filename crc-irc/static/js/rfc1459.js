// My implementation of a client as outlined in RFC1459

var RFC1459 = {
  "JOIN": function(){
    var chan = ENV.getChannelByName(this.args);
    if (!chan) {
      chan = new Channel(this.args);
    }
    // add user to IAL and channel user list
  },
  "PRIVMSG": function(){
    var sender = new User(this.source);
    var chan = this.target;
    var message = this.args;
    var _chan = ENV.getChannelByName(chan);
    if (_chan){
      _chan.pubmsg({sender: sender, message: message});
    }
  },
  "TOPIC": function(){
    var sender = new User(this.source);
    var chanName = this.target;
    var topic = this.args;
    ENV.getChannelByName(chanName).setTopic(topic);
  },
  "QUIT": function(){
    var sender = new User(this.source);
    var message = this.args;
    //ENV.quit(sender, message);
  },
  "332": function(){
    var chanName = this.target.split(' ')[1];
    var topic = this.args;
    ENV.getChannelByName(chanName).setTopic(topic);
  },
  "372": dump,
  "462": dump
};
