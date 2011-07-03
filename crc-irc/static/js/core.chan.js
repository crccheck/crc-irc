// Channel module

function Channel(name){
  name = name || 'Status';
  var self = this;
  this.channel = name;
  this.name = Channel.cleanName(name);
  if (document.getElementById(this.name)){
    return;
  }
  this.$elem = $('<section id="' + this.name +'" class="channel shadow">' +
    '<header><h1 class="channel-name">' + name + '</h1><h2 class="topic"></h2></header>' +
    '<aside><ul></ul></aside><ol class="content"></ol>' +
    '<footer><input type="text" placeholder="Message"></footer>').appendTo(CANVAS);
  this.$topic = this.$elem.find('h2');
  this.$content = this.$elem.find('ol');
  this.$input = this.$elem.find('input:first');
  if (name == 'Status'){
    this.$elem.children('aside').remove();
    this.$input.change(function(){
      self.echo({type: 'status', sender: '', message: this.value});
      send(this.value);
      this.value = '';
    });
  } else {
    this.$input.change(function(){
      self.echo({type: 'privmsg', sender: ENV.me || 'me', message: this.value});  // fake privmsg
      socket.json.send({action:'raw', message:"PRIVMSG " + self.channel + " " + this.value});
      this.value = '';
    });
    this.nicklist = [];
    this.$nicklist = this.$elem.find('aside > ul');
    this.$input.keydown(function(e){ self.autoComplete(e); });
    ENV.addChannel(this);
  }

  $(CANVAS).trigger('create', this);
}

// ------------------------ API -----------------------

// message(li)  li is a jquery list item: $(LI)
// manages timestamps, advances scroll bar, TODO manage scrollback
Channel.prototype.message = function(li){
  var now = new Date();
  li.prepend('<time datetime="' + now.strftime('%Y-%m-%dT%H:%M:%S%z') + '">' + now.strftime('%H:%M:%S') + '</time>');
  li.appendTo(this.$content);
  var extra_lines = this.$content.children().length - SCROLLBACK;
  if (extra_lines) {
    this.$content.children(':lt(' + extra_lines + ')').remove();
  }
  if (this.$content && this.$content.length) {
    this.$content[0].scrollTop = this.$content[0].scrollHeight;
  } else {
    console.log("missing $content", this);
  }
};

// echo(data)
// data -> {sender: User,
//          message: String,
//          type: String}
// type is ['privmsg', 'join', 'part']
Channel.prototype.echo = function(data){
  data.type = data.type.toLowerCase() || "";
  var line = $('<li class="' + data.type + '"/>').html(
    '<span class="nick">' + data.sender + '</span>' +
    '<span class="message"></span>');
  line.children('.message').text(data.message);
  $(CANVAS).trigger(data.type, $(line));  //trigger events before attaching to DOM
  this.message(line);
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
    this.$nicklist.append($('<li data-nick="'+nick+'">' + nick + '</li>'));
    return true;
  }
  return false;
};

Channel.prototype.delNick = function(nick){
  nick = User.cleanNick(nick);
  var idx = this.nicklist.indexOf(nick);
  if (idx !== -1){
    this.nicklist.splice(idx, 1);
    this.$nicklist.children(':[data-nick="' + nick + '"]').remove();
    return true;
  }
  return false;
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
  return s.replace(/^(#)/, '').toLowerCase();
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

Channel.prototype.autoComplete = function(e){
  function advance(insertSpace){
    target.selectionStart = target.selectionEnd;
    if (insertSpace){
      var before = text.substring(0, target.selectionStart);
      var after = text.substring(target.selectionEnd);
      target.value = before + " " + after;
    }
  }

  function wordUnderCursor(){
    var after = text.substring(target.selectionStart);
    return matchText + after.split(" ")[0];
  }

  var target = e.currentTarget;
  var text = target.value;
  if (e.which == 9){
    e.preventDefault();
    var newText = '';
    var before = text.substring(0, target.selectionStart);
    var after = text.substring(target.selectionEnd);
    var texts = before.split(' ');
    var matchText = texts[texts.length - 1];
    var matchIndex = 0;
    if (matchText){
      var matchTextRe = new RegExp("^" + matchText + ".", "i");
      var matchNicks = this.nicklist.filter(function(x){ return matchTextRe.test(x); });
      if (matchNicks.length){
        if (target.selectionStart != target.selectionEnd){
          if (matchNicks.length == 1){
            advance(true);
            return;
          } else if ((matchIndex = matchNicks.indexOf(wordUnderCursor())) !== -1){
            matchIndex = (matchIndex + 1) % matchNicks.length;
          }
        }
        var found = matchNicks[matchIndex].substr(matchText.length);
        newText = before + found + after;
        target.value = newText;
        target.select();
        target.setSelectionRange(before.length, before.length + found.length);
      }
    }
  } else if (e.which == 32){
    if (target.selectionStart != target.selectionEnd){
      advance();
      return;
    }
  }
};
