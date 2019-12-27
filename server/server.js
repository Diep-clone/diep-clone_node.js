'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

var users = [];

app.use(express.static(__dirname + '/..'));

io.on('connection', (socket) => {

  let player = {

  };

  socket.on('login', (data) => {

  });

  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('input', (data) => {
    
  });
});

server.listen(3000,() => {
  console.log('Socket IO server listening on port 3000');
});
