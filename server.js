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

  mapSize.x+= 322.5;
  mapSize.y+= 322.5;

  let index;

  let currentPlayer = {
    id:socket.id,
    x:0,
    y:0,
    dx:0,
    dy:0,
    radius:13,
    rotate:0,
    name:"",
    target:{
      x:0,
      y:0
    },
    type:0
  };

  socket.on('login', (player) => {
    if (sockets[socket.id]){
      console.log('넌 뭐야 저리가!!!');
      return false;
    }
    else{
      console.log('누군가가 들어왔다!!!');

      sockets[socket.id] = socket;

      currentPlayer.x = randomRange(-mapSize.x/2,mapSize.x/2);
      currentPlayer.y = randomRange(-mapSize.y/2,mapSize.y/2);

      index = users.length;
      users.push(currentPlayer);

      socket.emit('spawn', currentPlayer);
      io.emit('mapSize', mapSize);
    }
  });

  socket.on('ping!', () => {
    socket.emit('pong!');
  });

  socket.on('mousemove', (data) => {
    currentPlayer.target = data.target;
    currentPlayer.rotate = data.rotate;
  });

  socket.on('input', (data) => {
    currentPlayer.moveRotate = data.moveRotate;
  });

  socket.on('disconnect', () => {
    console.log('안녕 잘가!!!');
    mapSize.x-= 322.5;
    mapSize.y-= 322.5;
    users[index] = null;
    io.emit('objectDead','tank',currentPlayer);
    io.emit('mapSize', mapSize);
  });
});

function moveloop(){
  users.forEach((u) => {
    if (u){
      if (u.moveRotate != null){
        u.dx+=Math.cos(u.moveRotate) * 0.2;
        u.dy+=Math.sin(u.moveRotate) * 0.2;
      }
      u.x+=u.dx;
      u.y+=u.dy;
      u.dx*=0.95;
      u.dy*=0.95;
    }
  });
}

function sendUpdates(){
  users.forEach((u) => {
    if (u){
      sockets[u.id].emit('objectList',users);
    }
  })
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);

server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
