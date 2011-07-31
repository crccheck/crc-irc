// Public methods:
//   linkify.link()

var linkify = function(){
  //var MODULE_KEY = 'linkify';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;

  var re = /https?:[\S]+/ig;  //dirt simple, we don't care if this url works or not

  function link(s){
    return s.replace(re, '<a href="$&" target="_blank">$&</a>');
  }

  function process($line, data, win){
  //console.log(line, data, win);
    if (re.test(data.message)) {
      $line.children('span.message').html(function(i, s){
        return link(s);
      });
      data.message.match(re).forEach(function(url){
        if (/(jpg|jpeg|gif|png)($|\?)/.test(url)){
          var embed = $('<div class="embed"><img></div>');
          embed.children('img').error(function(){ embed.remove(); })
            .attr('src', url)
            .load(function(){
              var $this = $(this), MAX_HEIGHT = 80;
              console.log("load", this, $this.height(), $this.attr('height'));
              if ($this.height() > MAX_HEIGHT){
                $this.attr('height', MAX_HEIGHT);
              }
            });
          //win._message(embed);
          $line.append(embed);
        }
      });
    }
  }

  var timer;
  $(CANVAS).bind('privmsg', function(e, $line, data, win){
    if (DEBOUNCE){
      if (timer){ clearInterval(timer); }
      timer = setTimeout(function(){
        process($line, data, win);
      });
    } else {
      process($line, data, win);
    }
  });

  return {
    link: link
  };
}();
