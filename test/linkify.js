// plugin.linkify.js QUnit Tests
//

function get_link_text(blob){
  return $("<div>" + blob + "</div>").find('a').text();
}

module("plugin - linkify");

test("linkify.link test", function(){
  var valid_urls = ["http://www.google.com",
                    "https://www.google.com",
                    "https://www.google.com/",
                    "http://user:pass@www.google.com/",
                    "http://g-cdn.apartmenttherapy.com/2816614/il_570xN.264055372_rect540.jpg",
                    ["before https://www.google.com/", "https://www.google.com/"],
                    ["https://www.google.com/ after", "https://www.google.com/"],
                    ["before https://www.google.com/ after", "https://www.google.com/"],
                    ["[19:21:14] also, for background https://github.com/gabrielfalcao/lettuce/pull/138", "https://github.com/gabrielfalcao/lettuce/pull/138"]
                   ];
  var not_urls = ["",
                  "abcdefgh",
                  "ftp://127.0.0.1"];
  valid_urls.forEach(function(url){
    if ($.isArray(url)){
      equal(get_link_text(linkify.link(url[0])), url[1]);
    } else {
      notEqual(linkify.link(url), url);
    }
  });
  not_urls.forEach(function(url){
    equal(linkify.link(url), url);
  });
});

test("linkify.isImage test", function(){
  ok(!linkify.isImage(""));
  ok(!linkify.isImage("foo.bar"));
  ok(linkify.isImage("foo.jpg"));
  ok(linkify.isImage("foo.jpg?12345"));

});
