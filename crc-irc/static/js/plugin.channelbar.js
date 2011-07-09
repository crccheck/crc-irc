
(function(){
  var MODULE_KEY = 'channelbar';
  var MODULE_CANVAS = document.getElementById('pane-west');

  var state = deserialize(MODULE_KEY);

  var in_drag = false;  // prevent click handler from firing as a result of a drag/drop

  function saveState(){
    serialize(MODULE_KEY, state);
  }

  var $base = $('<section class="ui-channelbar"></section>').appendTo($(MODULE_CANVAS)),
      $main = $('#pane-main'),
      offset;

  $base.sortable({
    containment: 'parent',
    start: function(e, ui){
      in_drag = true;
    },
    stop: function(e, ui){
      setTimeout(function(){ in_drag = false; }, 1);
    },
    update: function(e, ui){
      var button = ui.item;
      var chan = button.data('channel');
      if (button.next().length){
        chan.$elem.insertBefore(button.next().data('channel').$elem);
      } else {
        chan.$elem.appendTo(CANVAS);
      }
    }
  });

  function addChanToBar(chan){
    chan._channelbar = {};
    var button = $('<div class="button">'+chan.raw_name+'<span class="unread"></span></div>')
      .data('channel', chan);
    chan._channelbar.button = button;
    chan._channelbar.hide = function(){
      chan.$elem.hide();
      button.addClass('closed');
    };
    chan._channelbar.show = function(){
      chan.$elem.show();
      chan.scrollDown();
      button.removeClass('closed');
    };
    button.click(function(e){
      if (in_drag) { return; }
      if (chan.$elem.is(':hidden')) {
        chan._channelbar.show();
        state[chan.raw_name].visible = true;
      } else {
        chan._channelbar.hide();
        state[chan.raw_name].visible = false;
      }
      saveState();
    });
    $base.append(button).sortable("refresh");
  }

  function addControlsToChan(chan){
    $('<button>hide</button>').click(function(){
      chan._channelbar.hide();
      state[chan.raw_name].visible = false;
      saveState();
    }).
    appendTo(chan.$nav);
  }

  function makeChanResizable(chan){
    chan._channelbar.setHeight = function(newHeight){
      var elems = chan.$elem.children('aside, ol');
      elems.height(newHeight - chan.$elem.children('header').outerHeight());
      state[chan.raw_name].height = newHeight;
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
    addControlsToChan(chan);
    makeChanResizable(chan);
    if (!state[chan.raw_name]) {
      state[chan.raw_name] = {};
    }
    if (state[chan.raw_name].visible === false) {
      chan._channelbar.hide();
    }
    if (state[chan.raw_name].height) {
      chan._channelbar.setHeight(state[chan.raw_name].height);
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
