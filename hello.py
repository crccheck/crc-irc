import inspect
import json
import os

import tornado.ioloop
import tornado.web
from tornado import websocket

import irclib

#irclib.DEBUG = True

irclib.Event.to_json = lambda event : json.dumps({
        'type': event.eventtype(),
        'source': event.source(),
        'target': event.target(),
        'arguments': event.arguments(),
    }, ensure_ascii=False)


class IRCCat(irclib.SimpleIRCClient):
    def _dispatcher(self, c, e):
        if e.eventtype() != 'all_raw_messages':
            push_to_client(c, e)
        return irclib.SimpleIRCClient._dispatcher(self, c, e)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/index.html")

def push_to_client(connection, event):
    if client is not None:
        client.write_message(event.to_json())

class EchoWebSocket(websocket.WebSocketHandler):
    def open(self):
        global client
        print "WebSocket opened"
        #self.irc = irclib.IRC()
        self.irc = IRCCat()
        #self.server.add_global_handler("all_events", push_to_client)
        #self.server.add_global_handler("welcome", push_to_client)
        #self.server.add_global_handler("join", push_to_client)
        #self.server.add_global_handler("privmsg", push_to_client)
        client = self
        self.irc.ircobj.process_once()

    def on_message(self, message):
        self.irc.ircobj.process_once()
        if not message:
            return
        one = message.split(None, 2)
        method = getattr(self.irc.connection, one[0], None)
        if inspect.ismethod(method):
            argsspec = inspect.getargspec(method)
            print argsspec
            args = message.split(None, len(argsspec.args) - 1)
            command = args[0]
            args = args[1:]
            try:
                if command == "connect":
                    args[1] = int(args[1])
                print args
                method(*args)
            except TypeError as e:
                self.write_message(json.dumps({'error': str(e)}))

    def on_close(self):
        print "WebSocket closed"
        #close self.irc if open

settings = {
    "debug": True,
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/ws", EchoWebSocket),
], **settings)

# really? this is how we're going to store state? ok
client = None

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
