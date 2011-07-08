(function(){
  var MODULE_KEY = 'stylin';
  var MODULE_CANVAS = document.getElementById('pane-south');

  var style = localStorage[MODULE_KEY] || '';
  var $style = $('<style type="text/css">' + style + '</style>').appendTo($('head'));

  var $modal = $('<div id="stylin">' +
    '<textarea>' + style + '</textarea>' +
    '</div>')
    .appendTo(document.body);
  var $text = $modal.children('textarea').keydown(function(e){
    if (e.which == 9){
      save();
      e.preventDefault();
    }
  });

  function resize(e, ui){
    $text.width($modal.width() - 2);
    $text.height($modal.height() - 2);
  }
  function save(){
    style = $text.val();
    $style.html(style);
    localStorage[MODULE_KEY] = style;
    var feedback = $('<span>Applying and Saving...</span>');
    feedback.appendTo($modal.nextAll('.ui-dialog-buttonpane'));
    setTimeout(function(){ feedback.fadeOut(1000); }, 100);
  }
  $modal.dialog({
      autoOpen: false,
      hide: 'slide',
      show: 'slide',
      title: "CSS",
      height: 270,
      width: 630,
      open: resize,
      resize: resize,
      buttons: [
        { text: "Apply",
          click: save }
      ]
    });

  var $butt = $('<button>Edit CSS</button>').click(function(){
    if ($modal.dialog('isOpen')){
      $modal.dialog('close');
    } else {
      $modal.dialog('open');
    }
  }).appendTo(MODULE_CANVAS);


})();
