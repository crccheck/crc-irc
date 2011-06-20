// DEPENDENCIES:
//

var ENV = {
  'channels': {},
  'users': {},
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
      return false;
      console.error("missing channel name", name, this.channels);
    }
  }
};
