(function(){
  var MODULE_KEY = 'stylin';
  var MODULE_CANVAS = document.getElementById('pane-south');

  var style = localStorage[MODULE_KEY] || '';
  var $style = $('<style type="text/css">' + style + '</style>').appendTo($('head'));

  var $modal = $('<div id="stylin" style="display: none;">' +
    '<h2>CSS</h2>' +
    '<textarea>' + style + '</textarea>' +
    '<button class="apply">Apply</button>' +
    '<button class="close">Close</button>' +
    '</div>')
    .draggable({handle: "h2"})
    .appendTo(document.body);

  function save(){
    style = $text.val();
    $style.html(style);
    localStorage[MODULE_KEY] = style;
    var feedback = $('<span>Applying and Saving...</span>');
    feedback.appendTo($modal);
    setTimeout(function(){ feedback.fadeOut(1000); }, 100);
  }
  var $text = $modal.children('textarea').keydown(function(e){
    if (e.which == 9){
      save();
      e.preventDefault();
    }
  });
  $modal.children('.apply').click(save);
  $modal.children('.close').click(function(){
    $modal.slideUp();
  });

  var $butt = $('<button>CSS</button>').click(function(){
    if ($modal.is(':visible')){
      $modal.slideUp();
    } else {
      $modal.slideDown();
    }
  }).appendTo(MODULE_CANVAS).click();


})();
