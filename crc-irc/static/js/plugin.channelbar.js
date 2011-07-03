
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
    var button = $('<div class="button">'+chan.channel+'</div>');
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


  function makeChanResizable($chan){
    $chan.resizable({
      handles: 's',
      minHeight: 35,
      stop: function(e, ui){
        var children = ui.element.children();
        var elems = ui.element.children('aside, ol');
        elems.height(ui.size.height - children.filter('header').outerHeight());
      }
    });
  }


  function updateOffset(){
    offset = $base.offset();
  }


  $(CANVAS).bind('create', function(e, chan){
    addChanToBar(chan);
    makeChanResizable(chan.$elem);
    if (!state[chan.channel]) {
      state[chan.channel] = {};
    }
    if (state[chan.channel].visible === false) {
      chan._channelbar.hide();
    }
    updateOffset();
  });


  $(window).bind('resize scroll', function(e, d){
    var $this = $(this),
        x = $this.scrollLeft(),
        y = $this.scrollTop();
    $base.toggleClass('fixed', y > offset.top);
    $base.css('left', -x);
  });
})();
