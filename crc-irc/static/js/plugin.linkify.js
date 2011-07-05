
var linkify = function(){
  //var MODULE_KEY = 'linkify';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;

  var re = /https?:[\S]+/ig;  //dirt simple, we don't care if this url works or not

  function link(s){
    return s.replace(re, '<a href="$&" target="_blank">$&</a>');
  }

  function process(line){
    if (ENV.me){
      line = $(line);
      line.children('span.message').html(function(i, s){
        return link(s);
      });
    }
  }

  var timer;
  $(CANVAS).bind('privmsg', function(e, data){
    if (DEBOUNCE){
      if (timer){ clearInterval(timer); }
      timer = setTimeout(function(){
        process(data);
      });
    } else {
      process(data);
    }
  });

  return {
    link: link
  };
}();
