var express = require('express'),
    morgan  = require('morgan'),
    self = this;
    self.app = express();
    http = require('http').Server(self.app),
    path = require('path');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

self.app.use(morgan('dev'));  // Log requests

self.app.use(express.static(path.join(__dirname, 'public'))); // Process static files

var io = require('socket.io').listen(http);

http.listen(server_port, server_ip_address);
console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), server_ip_address, server_port);

var gameSockets = require('./routes/serverSocket.js');
gameSockets.init(io);
