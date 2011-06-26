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
  equal(chan.channel, channel_name, line);
  ok(chan.hasNick('funky'));
});
test("PART", function(){
  var chan = new Channel(channel_name);
  var user = new User(address);
  var line = ":" + address + " PART " + channel_name + " :" + message;
  // joins
  chan.addNick(test_nick);
  // parts
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
  // joins again
  chan.addNick(test_nick);
  // parts with no message
  line = ":" + address + " PART " + channel_name;
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
  // someone manages to part without joining
  parse_chunk(line);
  ok(!chan.hasNick(test_nick), line);
});
test("PRIVMSG", function(){
  var chan = new Channel(channel_name);
  var user = new User(address);
  var line = ":" + address + " PRIVMSG " + channel_name + " :" + message;
  parse_chunk(line);
  deepEqual(ENV.getChannelByName(channel_name).get_message(0), {nick: user.nick, message: message}, line);
});
test("TOPIC, set topic", function(){
  var chan = new Channel(channel_name);
  var topic = "Is your cat dressing too sexy?";
  var line = ":" + address + " TOPIC " + channel_name + " :" + topic;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).topic, topic, line);
});
test("QUIT", function(){
  var line = ":" + address + " QUIT :Ping timeout: 240 seconds";
  parse_chunk(line);
  var chan = new Channel(channel_name);
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
  var chan = new Channel(channel_name);
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
    new Channel(channel_name);
  });
  var channelsAdded = ENV.getAllChannels().map(function(x) { return x.channel; });
  deepEqual(channelsAdded, channelsToAdd);
});

module("jquery");
test("can select nick's li", function(){
  ENV.reset();
  var chan = new Channel('#abc');
  chan.addNick('foobar');
  ok(chan.$nicklist.children(':[data-nick=foobar]').length);
  chan.addNick('sec^nd');
  ok(chan.$nicklist.children(':[data-nick="sec^nd"]').length);
  chan.addNick('sec`nd');
  ok(chan.$nicklist.children(':[data-nick="sec^nd"]').length);
});
