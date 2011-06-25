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


module("rfc1459");
var channel_name = "#foobar";
var address = "funky!~bunch@marky.mk";
var message = "hello world";
test("join", function(){
  ENV.reset();
  var line = ":" + address + " JOIN :" + channel_name;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).channel, channel_name, line);
  //TODO test that nick is in channel
});
test("privmsg", function(){
  var chan = new Channel(channel_name);
  var user = new User(address);
  var line = ":" + address + " PRIVMSG " + channel_name + " :" + message;
  parse_chunk(line);
  deepEqual(ENV.getChannelByName(channel_name).get_message(0), {nick: user.nick, message: message}, line);
});
test("332, get topic", function(){
  var topic = "Hot Topic";
  var line = ":irc.example.com 332 me " + channel_name + " :" + topic;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).topic, topic, line);
});
test("TOPIC, set topic", function(){
  var chan = new Channel(channel_name);
  var topic = "Is your cat dressing too sexy?";
  var line = ":" + address + " TOPIC " + channel_name + " :" + topic;
  parse_chunk(line);
  equal(ENV.getChannelByName(channel_name).topic, topic, line);
});
test("353, NAMES list", function(){
  var chan = new Channel(channel_name);
  var line = ":kornbluth.freenode.net 353 kurol = " + channel_name + " :AlexMax AntiSpamMeta BombStrike Candle Cide ClaesBas DLange DanGer Daviey Defektro DigitalKiwi Disp_ EnTeQuAk Epcylon Espen-_- ExtraSpice Fandekasp Frantic FunkyBob Gorroth GrahamDumpleton Grega Grepsd|BNC Henoxek IAmRoot Irex JDigital JanC_ JoeJulian Jygga KBme Katharsis Leonidas LiamM Llew Luyt Marchael MatToufoutu McMAGIC--Copy Modius MrITR NoNaMeNo Nume Oli`` PKKid-Work Pathin_ Perlboy Pici PiotrSikora Proditor Prometheus Quarryman R00sterJuice"
  parse_chunk(line);
  ok(ENV.getChannelByName(channel_name).hasNick('AlexMax'));
});
