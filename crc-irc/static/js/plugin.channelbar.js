
(function(){
  MODULE_KEY = 'channelbar';
  MODULE_CANVAS = document.getElementById('pane-west');

  var $base = $('<section class="ui-channelbar"></section>').appendTo($(MODULE_CANVAS)),
      $main = $('#pane-main');

  $(CANVAS).bind('create', function(e, chan){
    console.log('channel created', e, chan);
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
    console.log($base);
    $base.append(button);
  });
})();
