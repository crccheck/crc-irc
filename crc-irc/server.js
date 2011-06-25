var http = require('http'),
    nstatic = require('node-static');

// web and static media server
var file = new(nstatic.Server)('./static');
server = http.createServer(function(req, res){
  req.addListener('end', function(){
    file.serve(req, res);
  });
});
server.listen(6464);

require('./crc-irc.js').start(server);

