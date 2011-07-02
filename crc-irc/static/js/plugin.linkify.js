
(function(){
  //var MODULE_KEY = 'linkify';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;

  function process(line){
    if (ENV.me){
      var re = /https?:[\S]+/ig;  //dirt simple, we don't care if this url works or not
      line = $(line);
      line.children('span.message').html(function(i, s){
        return s.replace(re, '<a href="$&">$&</a>');
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
})();
