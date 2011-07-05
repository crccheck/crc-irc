
(function(){
  //var MODULE_KEY = 'hilight';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;

  function process(line, text){
    if (ENV.me){
      var re = new RegExp("\\b" + ENV.me.nick + "\\b", "ig");
      if (re.test(text)){
        notifications.create(text)
        line.addClass('mark');
      }
    }
  }

  var timer;
  $(CANVAS).bind('privmsg', function(e, line, data, chan){
    if (DEBOUNCE){
      if (timer){ clearInterval(timer); }
      timer = setTimeout(function(){
        process(line, data.message);
      });
    } else {
      process(line, data.message);
    }
  });
})();
