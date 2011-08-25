// Public methods:
//
//   linkify.link()
//
//   linkify.isImage()

var linkify = function(){
  //var MODULE_KEY = 'linkify';
  //var MODULE_CANVAS = document.getElementById('pane-north');
  var DEBOUNCE = false;
  var DEBOUNCE_INTERVAL = 1;
  var MEDIA_HEIGHT = 100;

  var re = /https?:[\S]+/ig;  //dirt simple, we don't care if this url works or not

  function link(s){
    return s.replace(re, '<a href="$&" target="_blank">$&</a>');
  }

  // test if a url is an image
  function isImage(url){
    return (/\.(jpg|jpeg|gif|png)($|\?)/).test(url);
  }

  function process($line, data, win){
    if (re.test(data.message)) {
      $line.children('span.message').html(function(i, s){
        return link(s);
      });
      data.message.match(re).forEach(function(url){
        if (!isImage(url)){ return; }

        var embed = $('<div class="embed"><img height='+MEDIA_HEIGHT+'/></div>');
        embed.children('img').error(function(){ embed.remove(); })
          .attr('src', url)
          .load(function(){
            var $this = $(this);
            if (this.naturalHeight < MEDIA_HEIGHT){
              $this.removeAttr('height');
            }
          });
        $line.append(embed);
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
    link: link,
    isImage: isImage
  };
}();
