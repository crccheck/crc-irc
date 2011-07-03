
(function(){
  var MODULE_KEY = 'channelbar';
  var MODULE_CANVAS = document.getElementById('pane-west');

  var $base = $('<section class="ui-channelbar"></section>').appendTo($(MODULE_CANVAS)),
      $main = $('#pane-main'),
      offset;


  function addChanToBar(chan){
    var button = $('<div class="button">'+chan.channel+'</div>');
    button.click(function(e){
      var visible = chan.$elem.is(':visible');
      if (visible) {
        chan.$elem.hide();
        button.addClass('closed');
      } else {
        button.removeClass('closed');
        chan.$elem.prependTo($main).show();
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
