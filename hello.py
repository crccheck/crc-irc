import inspect
import json
import os

import tornado.ioloop
import tornado.web
from tornado import websocket

import irclib

irclib.DEBUG = True

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/index.html")

class EchoWebSocket(websocket.WebSocketHandler):
    def open(self):
        print "WebSocket opened"
        self.irc = irclib.IRC()
        self.server = self.irc.server()

    def on_message(self, message):
        self.write_message(message)
        one = message.split(None, 2)
        #if callable(getattr(self.irc, one[0], None)):
        method = getattr(self.server, one[0], None)
        if inspect.ismethod(method):
            argsspec = inspect.getargspec(method)
            print argsspec
            args = message.split(None, len(argsspec.args) - 1)
            try:
                if args[0] == "connect":
                    args[2] = int(args[2])
                print args
                method(*args[1:])
            except TypeError as e:
                self.write_message(str(e))

    def on_close(self):
        print "WebSocket closed"
        #close self.irc if open

settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/ws", EchoWebSocket),
], **settings)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
