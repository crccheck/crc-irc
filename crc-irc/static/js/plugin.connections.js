
(function(){
  var MODULE_KEY = 'connections';
  var MODULE_CANVAS = document.getElementById('pane-north');

  var connections = deserialize(MODULE_KEY, []);
  var $base = $('<div id="connections"><ul></ul></div>').appendTo(MODULE_CANVAS);

  function exists(connection){
    return connections.some(function(e) { return e.hash == connection.hash; });
  }

  function addConnection(connection){
    if (exists(connection)) return false;
    connections.push(connection);
    serialize(MODULE_KEY, connections);
    return true;
  }

  function delConnection(connection){
    for (var i = 0; i < connections.length; ++i){
      if (connection.hash == connections[i].hash) break;
    }
    if (i < connections.length) {
      connections.splice(i, 1);
    }
    serialize(MODULE_KEY, connections);
  }

  function listConnections(){
    function connectionToHTML(c){
      return "host(" + c.host + ")";
    }
    var ul = $base.children('ul');
    ul.children().remove();
    connections.forEach(function(connection){
      var li = $('<li><span>' + connectionToHTML(connection) + '</span><button>del</button></li>');
      li.children('span').click(function(){
        $('#connect-nick').val(connection.nick);
        $('#connect-host').val(connection.host);
        $('#connect-port').val(connection.port);
        $('#connect-pass').val(connection.pass);
        $('#connect-name').val(connection.name);
      }).dblclick(function(){
        $('#connect-form').submit();
      });
      li.children('button').click(function(){
        li.remove();
        delConnection(connection);
      });
      li.appendTo(ul);
    });
  }

  $('#connect-form').submit(function(){
    var $this = $(this);
    var data = $this.serializeArray();
    var connection = {};
    data.forEach(function(o){
      connection[o.name] = o.value;
    });
    connection.hash = crc32($this.serialize());
    addConnection(connection);
  });

  listConnections();
})();
