// Window module

function Window(name){
  name = name || 'Status';
  var self = this;
  this.raw_name = name;
  this.name = Window.cleanName(name);
  this.unread = 0;
  if (document.getElementById(this.name)){
    return;
  }
  this.$elem = $('<section id="' + this.name +'" class="channel shadow">' +
    '<header><h1 class="channel-name">' + name + '</h1><h2 class="topic"></h2>' +
    '<h3></h3><nav></nav></header>' +
    '<aside><ul></ul></aside><ol class="content"></ol>' +
    '<footer><input type="text" placeholder="Message"></footer>').appendTo(CANVAS)
    .click(function(e){
      self.focus(e);
    })
    .blur(function(e){
      self.blur(e);
    });
  this.$topic = this.$elem.find('h2');
  this.$info = this.$elem.find('h3').click(function(){
    self.$content.scrollTop(self.$content.children().eq(-self.unread).offset().top);
  });
  this.$nav = this.$elem.find('nav');
  this.$content = this.$elem.find('ol');
  this.$input = this.$elem.find('input:first');
  this.nicklist = [];
  if (Window.isChannel(name)){
    this.type = 'channel';
    this.$input.keyup(function(e){
      if (e.which == 13){
        self.echo({type: 'privmsg', sender: ENV.me || 'me', message: this.value});  // fake privmsg
        commands.privmsg(self.raw_name, this.value);
        this.value = '';
      }
    });
    this.$nicklist = this.$elem.find('aside > ul');
    this.$input.keydown(function(e){ self.autoComplete(e); });
  } else {
    this.type = 'status';
    this.$elem.children('aside').remove();
    this.$input.keyup(function(e){
      if (e.which == 13){
        self.echo({type: 'status', sender: '', message: this.value});
        send(this.value);
        this.value = '';
      }
    });
  }

  ENV.addWindow(this);
  $(CANVAS).trigger('create', this);
}

// ------------------------ API -----------------------

// message(li)  li is a jquery list item: $(LI)
// manages timestamps, advances scroll bar, TODO manage scrollback
Window.prototype.message = function(li){
  var now = new Date();
  li.prepend('<time datetime="' + now.strftime('%Y-%m-%dT%H:%M:%S%z') + '">' + now.strftime('%H:%M:%S') + '</time>');
  li.appendTo(this.$content);
  var extra_lines = this.$content.children().length - SCROLLBACK;
  if (extra_lines) {
    this.$content.children(':lt(' + extra_lines + ')').remove();
  }
  this.scrollDown();
};

Window.prototype.scrollDown = function(){
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
Window.prototype.echo = function(data){
  data.type = data.type.toLowerCase() || "";
  var line = $('<li class="' + data.type + '" sender="' + data.sender + '"/>').html(
    '<span class="nick">' + data.sender + '</span>' +
    '<span class="message"></span>');
  line.children('.message').text(data.message);
  if (!this.$elem.hasClass('active')) {
    this.setUnread();
  }
  $(CANVAS).trigger(data.type, [$(line), data, this]);  //trigger events before attaching to DOM
  this.message(line);
};

// setUnread([number])
// if number is sent, set the number of unread, otherwise increment
Window.prototype.setUnread = function(num){
  if (isNaN(num)) {
    ++this.unread;
  } else {
    this.unread = num;
  }
  this.$info.text(this.unread);
  if (this.unread && this.$info.is(':hidden')){
    this.$info.slideDown();
  } else if (this.unread === 0 && this.$info.is(':visible')){
    this.$info.slideUp();
  }
};

// retrieve the i-th message in reverse chronological order, 0-indexed
Window.prototype.get_message = function(i){
  var collection = this.$elem.children('ol').children();
  var n = collection.length;
  if (i <= n){
    var line = collection.eq(n - i - 1);
    return {"nick": line.find('.nick').text(),
            "message": line.find('.message').text()};
  }
};

// setTopic(String)
Window.prototype.setTopic = function(s){
  this.topic = s;
  if (linkify) {
    s = s.replace(/</g, '&lt;');
    this.$topic.html(linkify.link(s));  // TODO sanitize
  } else {
    this.$topic.text(s);
  }
};

Window.prototype.hasNick = function(nick){
  nick = User.cleanNick(nick);
  return this.nicklist.indexOf(nick) !== -1;
};

Window.prototype.addNick = function(nick){
  nick = User.cleanNick(nick);
  if (!this.hasNick(nick)){
    this.nicklist.push(nick);
    this.$nicklist.append($('<li data-nick="'+nick+'">' + nick + '</li>'));
    return true;
  }
  return false;
};

Window.prototype.delNick = function(nick){
  nick = User.cleanNick(nick);
  var idx = this.nicklist.indexOf(nick);
  if (idx !== -1){
    this.nicklist.splice(idx, 1);
    this.$nicklist.children(':[data-nick="' + nick + '"]').remove();
    return true;
  }
  return false;
};

Window.prototype.addNicks = function(nickArray){
  var self = this;
  nickArray.forEach(function(nick){
    self.addNick(nick);
  });
};

Window.prototype.focus = function(e){
  if (this.$elem.hasClass('active')){ return; }
  this.setUnread(0);
  this.$elem.addClass('active');
  this.$elem.siblings('.active').removeClass('active');
  this.$elem.trigger('active', this);
  if (!e || e.target != this.$input[0]) {
    this.$input[0].focus();
  }
};

Window.prototype.blur = function(e){
  this.$elem.removeClass('active');
};
// -------------------- HELPERS --------------------

// cleanName(String)
// @return a standardized version of the channel name
Window.cleanName = function(s){
  return s.toLowerCase();
};

// isChannel(String)
// @return a boolean if a string is channel. If it isn't we assume it's a nick.
Window.isChannel = function(s){
  // return boolean if the string is a channel
  // TODO check ENV.chanmodes
  return s[0] == '#';
};

// @return the string representation of the channel
Window.prototype.toString = function(){
  return this.raw_name;
};

// @return a serializable version of the channel
Window.prototype.toObject = function(){

};

Window.prototype.autoComplete = function(e){
  // advance the cursor, optionally insert a space after the word under the cursor
  // if inserting a space, also add a colon if this is the first word
  function advance(insertSpace){
    target.selectionStart = target.selectionEnd;
    if (insertSpace){
      var before = text.substring(0, target.selectionStart);
      var after = text.substring(target.selectionEnd);
      if (/\s/.test(before)){
        target.value = before + " " + after;
      } else {
        target.value = before + ": " + after;
      }
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

$(function(){
  // we can't get a blur event on the channel $elem, so fake it by detecting clicks on the CANVAS
  $(CANVAS).click(function(e){
    var active;
    if (e.target == CANVAS && (active = $('section.channel.active')).length){
      var chan = ENV.getChannelByName(active[0].id);
      if (chan) { chan.$elem.trigger('blur'); }
    }
  });
});
