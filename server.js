var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static(__dirname + '/../client'));

var server = http.Server(app);
var io = socket_io(server);

var config  = require('./config.json');
var sockets = [];

io.on('connection', function (socket) {
    sockets.push(socket);
    sockets.set('rating', 0, function() {
      console.log('New user with rating 0.');
    });
});

var serverPort = process.env.PORT || config.port;
server.listen(serverPort);