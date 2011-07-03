
var notifications = function(){
  var MODULE_KEY = 'connections';
  var MODULE_CANVAS = document.getElementById('pane-north');
  var TIMEOUT = 10000;

  var $base = $('<div id="notifications"></div>').prependTo(MODULE_CANVAS);
  var type = 'browser';

  function getPermissions(){
    var button = $('<button>Enable Notifications</button>').click(function(){
      window.webkitNotifications.requestPermission();
      $(this).slideUp();
      type = 'desktop'; // assume the user said yes
    });
    $base.append(button);
  }

  if (window.webkitNotifications){
    if (window.webkitNotifications.checkPermission() === 0){
      type = 'desktop';
    } else {
      getPermissions();
    }
  }

  function create(text){
    //console.log("NOTIFICATION: " + text);
    var notification;
    if (type == 'desktop'){
      notification = window.webkitNotifications.createNotification('', '', text);
      notification.onclick = function(){ notification.cancel(); };
      setTimeout(function(){ notification.cancel(); }, TIMEOUT);
      return notification.show();
    } else {
      notification = $('<div>' + text + '</div>');
      notification.click(function(){ notification.remove(); });
      setTimeout(function(){ notification.remove(); }, TIMEOUT);
      return notification.appendTo($base);
    }
  }

  return {
    create: create
  };
}();
