'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

let users = [];
let sockets = {};

let mapSize = {x: 0,y: 0};

app.use(express.static(__dirname + '/static'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

function randomRange (x,y){
  if (x>y){
    let im = x;
    x=y;
    y=im;
  }
  return Math.random() * (y-x) + x;
}

io.on('connection', (socket) => {

  var currentPlayer = {
    id:socket.id,
    x:randomRange(-mapSize.x/2,mapSize.x/2),
    y:randomRange(-mapSize.y/2,mapSize.y/2),
    name:"d",
    target:{
      x:0,
      y:0
    },
    type:0
  };

  socket.on('login', (player) => {
    console.log("someone is coming!");

    sockets[socket.id] = socket;

    mapSize.x+= 322.5;
    mapSize.y+= 322.5;
    users.push(currentPlayer);
    socket.emit('spawnTank', currentPlayer);
    io.emit('mapSize', mapSize);
  });

  socket.on('ping!', () => {
    console.log("ping!");
    socket.emit('pong!');
  });

  socket.on('input', (data) => {
    currentPlayer.target = data.target;
  });

  socket.on('disconnect', () => {
    mapSize.x-= 322.5;
    mapSize.y-= 322.5;
    io.emit('mapSize', mapSize);
  });
});

function moveloop(){

}

function sendUpdates(){
  users.forEach( function (u){
    sockets[u.id].emit('objectList',users);
  })
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);

server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
