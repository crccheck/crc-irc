// My implementation of a client as outlined in RFC1459
// Add in alphabetical order, then numerics

var RFC1459 = {
  "JOIN": function(){
    var chan = ENV.getChannelByName(this.args);
    if (!chan) {
      chan = new Channel(this.args);
    }
    var sender = new User(this.source);
    chan.addNick(sender.nick);
    chan.echo({type: this.type, sender: sender});

    if (!ENV.me && ENV.me_nick && sender.nick == ENV.me_nick) {
      delete ENV.me_nick;
      ENV.me = sender;
    }
  },
  "MODE": implementlater,
  "PART": function(){
    var chan = ENV.getChannelByName(this.target);
    if (chan) {
      var sender = (new User(this.source));
      chan.delNick(sender.nick);
      chan.echo({type: this.type, sender: sender, message: this.args});
    }
  },
  "PRIVMSG": function(){
    var sender = new User(this.source);
    var chanName = this.target;
    var chan = ENV.getChannelByName(chanName);
    if (chan){
      chan.echo({type: this.type, sender: sender, message: this.args});
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
      if (chan.hasNick(sender.nick)){
        chan.echo({type: "quit", sender: sender, message: message});
        chan.delNick(sender.nick);
      }
    });
  },
  "001": function(){
    $('#connect-form')[0].reset();
    ENV.me_nick = this.target;
    notimplemented.call(this);
  },
  "250": implementlater,  // Highest connection count: ...
  "251": implementlater,  // There are ... users and ... invisible on ..servers
  "252": implementlater,  // ... : IRC Operators online
  "254": implementlater,  // ... :channels formed
  "255": implementlater,  // I have ... clients and .. servers
  "265": implementlater,  // Current local users ...
  "266": implementlater,  // Current global users ...
  "324": implementlater,  // channel modes
  "329": implementlater,  // how old ... something ... is
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
  "375": implementlater,  // MOTD opening
  "376": implementlater,  // End of /MOTD command
  "462": dump
};
