'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SAT = require('sat');
const io = require('socket.io')(server);

const quadtree = require('simple-quadtree');

let tree;

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

function findIndex(arr,id){
  let len = arr.length;

  while (len--){
    if (arr[len].id === id)
      return len;
  }
  return -1;
}

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
    w:13,
    h:13,
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

      tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

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

    tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

    if (findIndex(users,currentPlayer.id) > -1){
      users.splice(findIndex(users,currentPlayer.id),1);
    }
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

function movePlayer(u){
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

function tickPlayer(currentPlayer){
  movePlayer(currentPlayer);

  function check(user){
    if (user.id !== currentPlayer.id){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(playerCircle,
      new C(new V(user.x,user.y),user.radius),response);

      if (collided){
        response.aUser = currentPlayer;
        response.bUser = {
          id: user.id,
          name: user.name,
          x: user.x,
          y: user.y,
        }
        playerCollisions.push(response);
      }
    }

    return true;
  }

  function collisionCheck(collision){
    collision.aUser.isCollision = true;
  }

  var playerCircle = new C(new V(currentPlayer.x,currentPlayer.y),currentPlayer.radius);

  currentPlayer.isCollision = false;

  tree.clear();
  users.forEach(tree.put);
  var playerCollisions = [];

  var otherUsers = tree.get(currentPlayer,check);

  playerCollisions.forEach(collisionCheck);
}

function moveloop(){
  users.forEach((u) => {
    tickPlayer(u);
  });
}

function sendUpdates(){
  users.forEach((u) => {
    sockets[u.id].emit('objectList',users);
  })
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);

server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
