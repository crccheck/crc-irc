CRC-IRC
=======

A JavaScript based IRC client for the web. Too good to be true? **It is.**
I rely on a node.js proxy to make the actual connection and keep it alive.
But besides that... the rest is done in the browser.

Why make another IRC client?
----------------------------
I wanted a client that was:

* modern
* cross-platform
* customizable
* extensible

*Make a browser-based IRC Client* ![html5](http://www.w3.org/html/logo/downloads/HTML5_Badge_32.png)

I don't want to wade through menus and tabs to change my look, toggle timestamps on/off, toggle join/part/quits...

*I want to use CSS.*

I want to utilize the DOM to trigger events so third-party modules can easily plug in.

Installation
------------
Install node.js and node package manager
Install node modules (you may need to sudo):

    npm install node-static
    npm install socket.io

We don't really need node.js to serve the static media, it's just convenient.

Run the server (you may need to sudo)

    node hello.js

I haven't written the GUI for connecting yet.

Limitations
-----------

* I'm pretty sure it can only support one client at a time. It's an easy fix, but since I'm only writing it for myself right now, I don't care.
* Limited functionality. This should be considered pre-alpha and non-functional.

Needs
-----

* Packaging: I don't know how to package this thing. I haven't even gotten around to looking around at other projects.
* Testing: JavaScript testing is still evolving. I've seen [Jasmine](http://pivotal.github.com/jasmine/) and [QUnit](http://docs.jquery.com/Qunit). What else is out there?
* Licensing: Apache? MIT? GPL?

