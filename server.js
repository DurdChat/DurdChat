var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('client'));

var server = http.Server(app);
var io = socket_io(server);

var rpWaitinglist = [];
var talkWaitinglist = [];

var usersOnline = 0;

io.on('connection', function (socket) {
    usersOnline++;
    console.log('Users online: ' + usersOnline);
    socket.rating = 20;
    socket.partner = null;
    console.log('New user with rating: ' + socket.rating);
    console.log('RP Waiting: ' + rpWaitinglist.length);
    console.log('Talk Waiting: ' + talkWaitinglist.length);
    
    socket.on('getRating', function() {
      socket.emit('sendRating', socket.rating);
    });
    
    socket.on('onRPWaiting', function() {
      var minDifference = -1;
      var index = -1;
      for(var i = 0; i < rpWaitinglist.length; i++) {
        var difference = Math.abs(rpWaitinglist[i].rating - socket.rating);
        if((minDifference === -1 || difference <= minDifference) && difference <= 10) {
          minDifference = difference;
          index = i;
        }
      }
        
      //No partner found.
      if(index === -1) {
        console.log('No partner found. User added to RP waitinglist.');
        rpWaitinglist.push(socket);
      } else {
        console.log('Pairing partners.');
        //Pair partners.
        var partner = rpWaitinglist[index];
        //Remove partner from RP waitinglist.
        rpWaitinglist.splice(index, 1);
        removeFromWaitinglist(socket);
        socket.partner = partner;
        partner.partner = socket;
        
        socket.emit('partnerFound', partner.rating);
        partner.emit('partnerFound', socket.rating);
      }
      
      console.log('Waitinglists updated.');
      console.log('RP Waiting: ' + rpWaitinglist.length);
      console.log('Talk Waiting: ' + talkWaitinglist.length);
    });
    
    socket.on('onTalkWaiting', function() {
      var minDifference = -1;
      var index = -1;
      for(var i = 0; i < talkWaitinglist.length; i++) {
        var difference = Math.abs(talkWaitinglist[i].rating - socket.rating);
        if((minDifference === -1 || difference <= minDifference) && difference <= 10) {
          minDifference = difference;
          index = i;
        }
      }
        
      //No partner found.
      if(index === -1) {
        console.log('No partner found. User added to talk waitinglist.');
        talkWaitinglist.push(socket);
      } else {
        console.log('Pairing partners.');
        //Pair partners.
        var partner = talkWaitinglist[index];
        //Remove partner from RP waitinglist.
        talkWaitinglist.splice(index, 1);
        removeFromWaitinglist(socket);
        socket.partner = partner;
        partner.partner = socket;
        
        socket.emit('partnerFound', partner.rating);
        partner.emit('partnerFound', socket.rating);
      }
      
      console.log('Waitinglists updated.');
      console.log('RP Waiting: ' + rpWaitinglist.length);
      console.log('Talk Waiting: ' + talkWaitinglist.length);
    });
    
    socket.on('disconnect', function() {
      usersOnline--;
      console.log('Users online: ' + usersOnline);
      removeFromWaitinglist(socket);
      console.log('User exited and removed from waitinglist.');
      console.log('RP Waiting: ' + rpWaitinglist.length);
      console.log('Talk Waiting: ' + talkWaitinglist.length);
    });
    
    socket.on('removeFromWaitinglist', function() {
      removeFromWaitinglist(socket);
      console.log('Received removal request.');
    });
    
    socket.on('sendMessage', function(msg) {
      socket.partner.emit('sendMessage', msg);
    });
    
    socket.on('chatDisconnect', function() {
      socket.partner.emit('partnerDisconnected');
    });
    
    socket.on('sendRating', function(rating) {
      socket.partner.rating += rating;
      socket.partner.emit('updateRating');
      socket.partner = null;
    });
});

function removeFromWaitinglist(socket) {
  console.log('Removed from waitinglist.');
  console.log('RP Waiting: ' + rpWaitinglist.length);
  console.log('Talk Waiting: ' + talkWaitinglist.length);
  
  for(var i = 0; i < rpWaitinglist.length; i++) {
    if(rpWaitinglist[i].id === socket.id) {
      rpWaitinglist.splice(i, 1);
    }
  }
  for(i = 0; i < talkWaitinglist.length; i++) {
    if(talkWaitinglist[i].id === socket.id) {
      talkWaitinglist.splice(i, 1);
    }
  }
}

var serverPort = process.env.PORT;
var serverHost = process.env.IP;
server.listen(serverPort, serverHost);