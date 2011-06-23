module("psplit");
var s = "1 2 3 4 5";
test("psplit without limit", function(){
  deepEqual(s.psplit(" "), ["1", "2", "3", "4", "5"]);
});
test("psplit with limit", function(){
  deepEqual(s.psplit(" ", 2), ["1", "2 3 4 5"]);
});
test("psplit with limit set too high", function(){
  deepEqual(s.psplit(" ", 6), ["1", "2", "3", "4", "5"]);
});
test("psplit with regexp", function(){
  deepEqual(s.psplit(/ /), ["1", "2", "3", "4", "5"]);
});
test("psplit with regexp and limit behaves like split", function(){
  deepEqual(s.psplit(/ /, 2), ["1", "2"]);
});


module("parse line");
test("typical PRIVMSG", function(){
  var line = ":Test!~name@192.168.233.62 PRIVMSG #help :okay cheers";
  deepEqual(parse_line(line), {"line": line,
                               "source": "Test!~name@192.168.233.62",
                               "type": "PRIVMSG",
                               "target": "#help",
                               "args": "okay cheers"});
});
test("separators in the message", function(){
  var line = ":Test!~name@192.168.233.62 PRIVMSG #help :okay :cheers :";
  deepEqual(parse_line(line), {"line": line,
                               "source": "Test!~name@192.168.233.62",
                               "type": "PRIVMSG",
                               "target": "#help",
                               "args": "okay :cheers :"});
});
test("no message", function(){
  var line = ":Test!~name@192.168.233.62 PART #mychannel";
  deepEqual(parse_line(line), {"line": line,
                               "source": "Test!~name@192.168.233.62",
                               "type": "PART",
                               "target": "#mychannel",
                               "args": undefined});
});
