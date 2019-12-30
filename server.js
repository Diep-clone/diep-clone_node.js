'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SAT = require('sat');
const io = require('socket.io')(server);

let V = SAT.Vector;
let C = SAT.Circle;

let users = [];
let bullets = [];
let sockets = {};

let mapSize = {x: 0,y: 0};
let tankLength = 11;

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
    type:0,
    isCollision:false,
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
    if (data.shot>0){

    }
    if (data.changeTank){
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
    }
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

function bulletSet(x,y,rotate,type){
  switch(type){
    case 0:

    break;
    default:
    break;
  }
}

function moveloop(){
  users.forEach((u) => {
    if (u){
      let playerCircle = new C(new V(u.x,u.y),u.radius);
      for (let i=0;i<users.length;i++){
        if (users[i] && u!=users[i]){
          let response = new SAT.Response();
          let collided = SAT.testCircleCircle(playerCircle,
          new C(new V(users[i].x,users[i].y),users[i].radius),response);

          if (collided){
            users[i].isCollision = true;
            u.isCollision = true;
          }
          else{
            users[i].isCollision = false;
            u.isCollision = false;
          }
        }
      }

      if (u.moveRotate!=null && !isNaN(u.moveRotate)){ // playerMove
        u.dx+=Math.cos(u.moveRotate) * 0.07;
        u.dy+=Math.sin(u.moveRotate) * 0.07;
      }
      u.x+=u.dx;
      u.y+=u.dy;
      u.dx*=0.98;
      u.dy*=0.98;
      if (u.x>mapSize.x+51.6) u.x=mapSize.x+51.6;
      if (u.x<-mapSize.x-51.6) u.x=-mapSize.x-51.6;
      if (u.y>mapSize.y+51.6) u.y=mapSize.y+51.6;
      if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
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
