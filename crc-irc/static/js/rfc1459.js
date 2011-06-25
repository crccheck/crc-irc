// My implementation of a client as outlined in RFC1459

var RFC1459 = {
  "JOIN": function(){
    var chan = ENV.getChannelByName(this.args);
    if (!chan) {
      chan = new Channel(this.args);
    }
    var nick = (new User(this.source)).nick;
    chan.addNick(nick);
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
    ENV.getAllChannels().forEach(function(chan){
      chan.delNick(sender.nick);
      // TODO display quit message
    });
  },
  "332": function(){
    var chanName = this.target.split(' ')[1];
    var topic = this.args;
    ENV.getChannelByName(chanName).setTopic(topic);
  },
  "333": implementlater,  // how old the topic is
  "353": function(){
    // NAMES response
    var chanName = this.target.split(' ')[2];
    var chan = ENV.getChannelByName(chanName);
    chan.addNicks(this.args.split(' '));
  },
  "366": ignore,  // End of /NAMES list
  "372": implementlater,  // welcome
  "462": dump
};
