// crc-irc.js QUnit Tests
//
// Keywords Used:
//
// * MOCK - an event was faked using the internal API


module("util - psplit");
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
module("util - serializers");
test("deserialize can take multiple defaults", function(){
  localStorage.clear('test');
  deepEqual(deserialize('test'), {});
  deepEqual(deserialize('test', '{}'), {});
  deepEqual(deserialize('test', []), []);
  deepEqual(deserialize('test', '[]'), []);
  deepEqual(deserialize('test', 4), 4);
  deepEqual(deserialize('test', undefined), {});  // why would you pass in undefined?
  localStorage.clear('test');
});
test("util - crc32", function(){
  equal(crc32(''), '0');
  // took these tests from http://www.createwindow.com/programming/crc32/crcverify.htm
  equal(crc32('resume'), '60c1d0a0');
  equal(crc32('resumé'), '84cf1fab');
  // found these on http://www.opensource.apple.com/source/tcl/tcl-87/tcl_ext/tcllib/tcllib/modules/crc/crc32.test
  equal(crc32('a'), 'e8b7be43');
  equal(crc32('abc'), '352441c2');
  equal(crc32('message digest'), '20159d7f');
  equal(crc32('abcdefghijklmnopqrstuvwxyz'), '4c2750bd');
  equal(crc32('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), '1fc2e6d2');
  equal(crc32('12345678901234567890123456789012345678901234567890123456789012345678901234567890'), '7ca94a72');
  equal(crc32('\uFFFE\u0000\u0001\u0002'), 'b0e8eee5');
  equal(crc32('-'), '97ddb3f8');
  equal(crc32('--'), '242c1465');
});
test("serialize then deserialize", function(){
  localStorage.clear('test');
  serialize('test', 0);
  deepEqual(deserialize('test'), 0);
  serialize('test', '0');
  deepEqual(deserialize('test'), '0');
  serialize('test', [0,1,2]);
  deepEqual(deserialize('test'), [0,1,2]);
  serialize('test', {'a':'b'});
  deepEqual(deserialize('test'), {'a':'b'});
  localStorage.clear('test');
});


(function(){
  var win;
  module("core.win.js api", {
    setup: function(){ win = new Window('#test'); },
    teardown: function(){ }});
  test("scrollDown", function(){
    win.scrollDown();
    // test incomplete, but enh
  });
  test("echo", function(){
    win.echo({sender: new User('nick!moo@blah.blah'),
              message: 'Pew Pew Pew',
              type: 'privmsg'});
    var result = win.get_message(0);
    equal(result.message, 'Pew Pew Pew');
  });
  test("setUnread", function(){
    equal(win.unread, 0);
    win.setUnread();
    equal(win.unread, 1);
    win.setUnread(0);
    equal(win.unread, 0);
    win.setUnread(10);
    equal(win.unread, 10);
  });
  test("setTopic", function(){
    win.setTopic("");
    equal(win.topic, "");
    win.setTopic("a");
    equal(win.topic, "a");
  });
  test("hasNick", function(){
    ok(!win.hasNick("boom"));
    win.addNick("boom");
    ok(win.hasNick("boom"));
    ok(!win.hasNick("moob"));
  });
  test("addNick", function(){
    win.addNick("boom");
    ok(win.hasNick("boom"));
  });
  test("delNick", function(){
    win.addNick("boom");
    ok(win.hasNick("boom"));
    win.delNick("boom");
    ok(!win.hasNick("boom"));
  });
  test("addNick", function(){
    win.addNicks(["boom", "moob"]);
    ok(win.hasNick("boom"));
    equal(win.nicklist.length, 2);
  });
  test("focus", function(){
    win.focus();
    ok(win.$elem.hasClass('active'));
  });
  test("blur", function(){
    win.focus();
    ok(win.$elem.hasClass('active'));
    win.blur();
    ok(!win.$elem.hasClass('active'));
  });
})();

module("core.win.js helpers");
test("cleanName", function(){
  equal(Window.cleanName('status'), 'status');
  equal(Window.cleanName('#status'), '#status');
  equal(Window.cleanName('#sTaTuS'), '#status');
});

test("stripPrefix", function(){
  equal(Window.stripPrefix('status'), 'status');
  equal(Window.stripPrefix('#status'), 'status');
  equal(Window.stripPrefix('#sTaTuS'), 'sTaTuS');
});
test("isChannel", function(){
  ok(Window.isChannel('#'));
  ok(Window.isChannel('#channel'));
  ok(!Window.isChannel('channel'));
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


module("rfc1459");
// In alphabetical order, then numerics
var channel_name = "#foobar";
var test_nick = "funky";
var address = test_nick + "!~bunch@marky.mk";
var message = "hello world";
test("JOIN", function(){
  ENV.reset();
  var line = ":" + address + " JOIN :" + channel_name;
  parse_chunk(line);
  var chan = ENV.getChannelByName(channel_name);
  equal(chan.raw_name, channel_name, line);
  ok(chan.hasNick(test_nick));
  var user = new User(address);
  deepEqual(user.getChannels(), [chan]);
});
test("NICK", function(){
  ENV.reset();
  var chan = new Window(channel_name);
  var user = new User(address);
  // MOCK join
  chan.addNick(test_nick);
  var line = ":" + address + " NICK :santa";
  parse_chunk(line);
  ok(!chan.hasNick(test_nick));
  ok(chan.hasNick('santa'));
});
test("PART", function(){
  var chan = new Window(channel_name);
  var user = new User(address);
  var line = ":" + address + " PART " + channel_name + " :" + message;
  // MOCK join
  chan.addNick(test_nick);
  // parts
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
  // MOCK join again
  chan.addNick(test_nick);
  // parts with no message
  line = ":" + address + " PART " + channel_name;
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
  // someone manages to part without joining
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
});
test("PRIVMSG user gets sent to status", function(){
  var chan = new Window('#foobar');
  var user = new User(address);
  var line = ":" + address + " PRIVMSG foobar :" + message;
  parse_chunk(line);
  deepEqual(ENV.statusWindow.get_message(0), {nick: user.nick, message: message}, line);
});
test("PRIVMSG channel", function(){
  var chan = new Window(channel_name);
  var user = new User(address);
  var line = ":" + address + " PRIVMSG " + channel_name + " :" + message;
  parse_chunk(line);
  deepEqual(ENV.getChannelByName(channel_name).get_message(0), {nick: user.nick, message: message}, line);
});
test("PRIVMSG action channel", function(){
  var chan = new Window(channel_name);
  var user = new User(address);
  var line = ":" + address + " PRIVMSG " + channel_name + " :\u0001ACTION " + message + "\u0001";
  parse_chunk(line);
  deepEqual(ENV.getChannelByName(channel_name).get_message(0), {nick: user.nick, message: " " + message}, line);
});
test("TOPIC, set topic", function(){
  var chan = new Window(channel_name);
  var topic = "Is your cat dressing too sexy?";
  var line = ":" + address + " TOPIC " + channel_name + " :" + topic;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).topic, topic, line);
});
test("QUIT", function(){
  var line = ":" + address + " QUIT :Ping timeout: 240 seconds";
  parse_chunk(line);
  var chan = new Window(channel_name);
  chan.addNick(test_nick);
  ok(chan.hasNick(test_nick));
  equal(chan.nicklist.length, 1);
  equal(chan.$nicklist.children().length, 1);
  parse_chunk(line);
  ok(!chan.hasNick(test_nick));
  equal(chan.nicklist.length, 0);
  equal(chan.$nicklist.children().length, 0);
});
test("332, get topic", function(){
  var topic = "Hot Topic";
  var line = ":irc.example.com 332 me " + channel_name + " :" + topic;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).topic, topic, line);
});
test("353, NAMES list", function(){
  var chan = new Window(channel_name);
  var line = ":kornbluth.freenode.net 353 kurol = " + channel_name + " :@SomeOp +SomeVoice SomeNick DLange DanGer Daviey Defektro DigitalKiwi Disp_ EnTeQuAk Epcylon Espen-_- ExtraSpice Fandekasp Frantic FunkyBob Gorroth GrahamDumpleton Grega Grepsd|BNC Henoxek IAmRoot Irex JDigital JanC_ JoeJulian Jygga KBme Katharsis Leonidas LiamM Llew Luyt Marchael MatToufoutu McMAGIC--Copy Modius MrITR NoNaMeNo Nume Oli`` PKKid-Work Pathin_ Perlboy Pici PiotrSikora Proditor Prometheus Quarryman R00sterJuice";
  parse_chunk(line);
  ok(ENV.getChannelByName(channel_name).hasNick('SomeOp'));
  ok(ENV.getChannelByName(channel_name).hasNick('SomeVoice'));
  ok(ENV.getChannelByName(channel_name).hasNick('SomeNick'));
});


module("env");
test("getAllChannels", function(){
  ENV.reset();
  var channelsToAdd = ['#a', '#b', '#c'];
  channelsToAdd.forEach(function(channel_name){
    new Window(channel_name);
  });
  var channelsAdded = ENV.getAllChannels().map(function(x) { return x.raw_name; });
  deepEqual(channelsAdded, channelsToAdd);
});

module("jquery");
test("can select nick's li", function(){
  ENV.reset();
  var chan = new Window('#abc');
  chan.addNick('foobar');
  ok(chan.$nicklist.children(':[data-nick=foobar]').length);
  chan.addNick('sec^nd');
  ok(chan.$nicklist.children(':[data-nick="sec^nd"]').length);
  chan.addNick('sec`nd');
  ok(chan.$nicklist.children(':[data-nick="sec^nd"]').length);
});
