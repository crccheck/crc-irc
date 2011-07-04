
(function(){
  var MODULE_KEY = 'channelbar';
  var MODULE_CANVAS = document.getElementById('pane-west');

  var state = deserialize(MODULE_KEY);

  function saveState(){
    serialize(MODULE_KEY, state);
  }

  var $base = $('<section class="ui-channelbar"></section>').appendTo($(MODULE_CANVAS)),
      $main = $('#pane-main'),
      offset;


  function addChanToBar(chan){
    chan._channelbar = {};
    var button = $('<div class="button">'+chan.channel+'<span class="unread"></span></div>');
    chan._channelbar.button = button;
    chan._channelbar.hide = function(){
      chan.$elem.hide();
      button.addClass('closed');
    };
    chan._channelbar.show = function(){
      button.removeClass('closed');
      chan.$elem.prependTo($main).show();
    };
    button.click(function(e){
      var visible = chan.$elem.is(':visible');
      state[chan.channel].visible = !visible;
      saveState();
      if (visible) {
        chan._channelbar.hide();
      } else {
        chan._channelbar.show();
      }
    });
    $base.append(button);
  }


  function makeChanResizable(chan){
    chan._channelbar.setHeight = function(newHeight){
      var elems = chan.$elem.children('aside, ol');
      elems.height(newHeight - chan.$elem.children('header').outerHeight());
      state[chan.channel].height = newHeight;
      saveState();
    };
    chan.$elem.resizable({
      handles: 's',
      minHeight: 35,
      stop: function(e, ui){
        chan._channelbar.setHeight(ui.size.height);
      }
    });
  }


  function updateOffset(){
    offset = $base.offset();
  }


  $(CANVAS).bind('create', function(e, chan){
    addChanToBar(chan);
    makeChanResizable(chan);
    if (!state[chan.channel]) {
      state[chan.channel] = {};
    }
    if (state[chan.channel].visible === false) {
      chan._channelbar.hide();
    }
    if (state[chan.channel].height) {
      chan._channelbar.setHeight(state[chan.channel].height);
    }
    updateOffset();
  });


  $(CANVAS).bind('privmsg', function(e, line, data, chan){
    chan._channelbar.button.children('.unread').html(chan.unread || '');
  });

  $(CANVAS).bind('active', function(e, chan){
    chan._channelbar.button.children('.unread').html('');
  });


  $(window).bind('resize scroll', function(){
    var $this = $(this),
        x = $this.scrollLeft(),
        y = $this.scrollTop();
    $base.toggleClass('fixed', y > offset.top);
    $base.css('left', -x);
  });
})();
