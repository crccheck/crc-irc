
(function(){
  //var MODULE_KEY = 'hilight';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;

  function process(line){
    if (ENV.me){
      var re = new RegExp("\\b" + ENV.me.nick + "\\b", "ig");
      line = $(line);
      if (re.test(line.children('span.message').html())){
        line.addClass('mark');
      }
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
