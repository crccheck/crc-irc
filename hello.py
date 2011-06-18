import os

import tornado.ioloop
import tornado.web
from tornado import websocket

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("templates/index.html")

class EchoWebSocket(websocket.WebSocketHandler):
    def open(self):
        print "WebSocket opened"

    def on_message(self, message):
        self.write_message(message)

    def on_close(self):
        print "WebSocket closed"

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
