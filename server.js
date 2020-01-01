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

function setGun(user){
  switch(user.type){
    case 0:
      user.gun = [{
        bulletType:1,
        speed:1,
        damage:1,
        health:1,
        radius:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        pos:{x:0,y:1.8},
        dir:{rotate:null,distance:0}
      }];
    break;
    default:
    break;
  }
}

io.on('connection', (socket) => {

  mapSize.x+= 322.5;
  mapSize.y+= 322.5;

  let index;

  let currentPlayer = {
    id:socket.id,
    x:0,
    y:0,
    w:10,
    h:10,
    dx:0,
    dy:0,
    radius:13,
    rotate:0,
    name:"",
    mouse:{
      left: false,
      right: false
    },
    target:{
      x:0,
      y:0
    },
    guns:[],/*
    {
      bulletType:int,
      speed:%,
      damage:%,
      health:%,
      radius:%,
      coolTime:%,
      shotTime:0.0f,
      shotPTime:%,
      autoShot:true/false,
      pos:{x:%,y:%},
      dir:{rotate:pi,distance:%}
    }
    */
    stats:[0,0,0,0,0,0,0,0],
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
    currentPlayer.mouse.left = data.shot>0;
    if (data.changeTank){
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
      setGun(currentPlayer);
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

function bulletSet(user){
  for (let i=0;i<user.gun.length;i++){
    if ((user.mouse.left || user.gun[i].autoShot) && user.gun[i].coolTime == 0){
      bullets.push({
        type: user.gun[i].bulletType,
        x: user.x + Math.cos(user.rotate-Math.PI/2) * user.gun[i].pos.x + Math.cos(user.rotate) * user.gun[i].pos.y,
        y: user.y + Math.sin(user.rotate-Math.PI/2) * user.gun[i].pos.x + Math.sin(user.rotate) * user.gun[i].pos.y,
        rotate: user.gun[i].dir.rotate===null?user.rotate:user.gun[i].dir.rotate,
        dx: Math.cos(this.rotate) * 1,
        dy: Math.sin(this.rotate) * 1,
        speed: 0,
        health: 8,
        damage: 7,
        radius: 7
      });
      user.gun[i].coolTime = 0.6 * user.gun[i].shotTime;
    }
  }
}

function tickPlayer(currentPlayer){
  movePlayer(currentPlayer);
  bulletSet(currentPlayer);

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
    sockets[u.id].emit('objectList',users,bullets);
  })
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);

server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
