'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SAT = require('sat');
const io = require('socket.io')(server);

const util = require('./lib/librarys');
const objUtil = require('./lib/objectSet');
const userUtil = require('./lib/userSet');
const bulletUtil = require('./lib/bulletSet');

const quadtree = require('simple-quadtree');

let tree;

let V = SAT.Vector;
let C = SAT.Circle;

let users = []; // 유저 목록. 탱크의 정보와 똑같다.
let bullets = []; // 총알 목록.
let sockets = {}; // 유저 접속 목록.

let mapSize = {x: 0,y: 0}; // 맵 크기.
let tankLength = 53; // 탱크의 목록 길이. 지금은 Basic 부터 Destroyer 까지 총 11개다.

app.use(express.static(__dirname + '/static')); // 클라이언트 코드 목록 불러오기.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => { // 접속.

  mapSize.x+= 322.5;
  mapSize.y+= 322.5;

  tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

  let index;

  let currentPlayer = { // 현재 플레이어 객체 생성.
    objType: 'tank',
    id:socket.id, // 플레이어의 소켓 id
    x:0,
    y:0,
    w:10,
    h:10,
    dx:0,
    dy:0,
    level:1,
    health:48,
    maxHealth:48,
    lastHealth:48,
    damage:20,
    radius:12.8,
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
    sight:1.78,
    guns:[],
    stats:[0,0,0,0,0,0,0,0],
    type:0,
    isCollision:false
  };

  socket.on('login', (player) => { // 탱크 생성.
    if (sockets[socket.id]){
      console.log('넌 뭐야 저리가!!!');
      return false;
    }
    else{
      console.log('누군가가 들어왔다!!!');

      sockets[socket.id] = socket;

      currentPlayer.x = util.randomRange(-mapSize.x/2,mapSize.x/2);
      currentPlayer.y = util.randomRange(-mapSize.y/2,mapSize.y/2);
      userUtil.setUserGun(currentPlayer);

      index = users.length;
      users.push(currentPlayer);

      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
      socket.emit('sight',userUtil.setUserSight(currentPlayer));
      socket.emit('spawn', currentPlayer);
      io.emit('mapSize', mapSize);
    }
  });

  socket.on('ping!', () => { // 핑퐁
    socket.emit('pong!');
  });

  socket.on('mousemove', (data) => { // 마우스 좌표, 탱크의 방향
    currentPlayer.target = data.target;
    currentPlayer.rotate = data.rotate;
  });

  //연구 목적 소켓
  socket.on('changeRadius', (data) => {
    currentPlayer.radius = Math.round(data*100)/100;
  });

  socket.on('changeLevel', (data) => {
    currentPlayer.level = Math.min(data,45);
    currentPlayer.sight = userUtil.setUserSight(currentPlayer);
    socket.emit('sight',userUtil.setUserSight(currentPlayer));
  });

  // ------------끝-------------

  socket.on('input', (data) => { // 입력 정보
    currentPlayer.moveRotate = data.moveRotate;
    currentPlayer.mouse.left = data.shot>0 || data.autoE;
    if (data.o){
      if (util.findIndex(users,currentPlayer.id) > -1){
        users.splice(util.findIndex(users,currentPlayer.id),1);
        io.emit('objectDead',currentPlayer);
      }
    }
    if (data.changeTank){
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
      userUtil.setUserGun(currentPlayer);
      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
      socket.emit('sight',userUtil.setUserSight(currentPlayer));
    }
  });

  socket.on('disconnect', () => { // 연결 끊김
    console.log('안녕 잘가!!!');
    mapSize.x-= 322.5;
    mapSize.y-= 322.5;

    tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

    if (util.findIndex(users,currentPlayer.id) > -1){
      users.splice(util.findIndex(users,currentPlayer.id),1);
      io.emit('objectDead',currentPlayer);
    }
    io.emit('mapSize', mapSize); // 여기 tab 스페이스 바 크기 어떻게 설정해요?
  });
});

function tickPlayer(currentPlayer){ // 프레임 당 유저(탱크) 계산
  userUtil.moveUser(currentPlayer,mapSize);
  bullets = bullets.concat(bulletUtil.bulletSet(currentPlayer));

  currentPlayer.lastHealth = currentPlayer.health; // lastHealth 는 데미지 계산 당시에 사용할 이전 체력 값이다. 이 값이 없다면 데미지 계산을 제대로 하지 못한다.

  function check(obj){ // 충돌했는가?
    if ((!obj.owner || obj.owner !== currentPlayer.id) && obj.id !== currentPlayer.id && currentPlayer.isCollision == false && obj.isCollision == false){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(playerCircle,
      new C(new V(obj.x,obj.y),obj.radius),response);

      if (collided){
        response.aUser = currentPlayer;
        response.bUser = obj;
        playerCollisions.push(response);
      }
    }

    return true;
  }

  function collisionCheck(collision){ // 충돌했을 때 계산!
    let dir = Math.atan2(collision.aUser.y-collision.bUser.y,collision.aUser.x-collision.bUser.x);

    collision.aUser.isCollision = collision.bUser.isCollision = true; // 두 오브젝트를 둘 다 충돌됨으로 설정해 한 프레임에 두번 충돌하게 하지 않는다.

    io.emit('objectHit',collision.aUser);
    io.emit('objectHit',collision.bUser);

    collision.aUser.dx+=Math.cos(dir) * 1;
    collision.aUser.dy+=Math.sin(dir) * 1;
    collision.bUser.dx-=Math.cos(dir) * 1;
    collision.bUser.dy-=Math.sin(dir) * 1;

    if (collision.bUser.lastHealth-collision.aUser.damage<=0){
      collision.aUser.health-=collision.bUser.damage*(collision.bUser.lastHealth/collision.aUser.damage);
    }
    else{
      collision.aUser.health-=collision.bUser.damage;
    }
    if (collision.aUser.lastHealth-collision.bUser.damage<=0){
      collision.bUser.health-=collision.aUser.damage*(collision.aUser.lastHealth/collision.bUser.damage);
    }
    else{
      collision.bUser.health-=collision.aUser.damage;
    }
  }

  var playerCircle = new C(new V(currentPlayer.x,currentPlayer.y),currentPlayer.radius);

  tree.clear();
  users.forEach(tree.put);
  bullets.forEach(tree.put);
  var playerCollisions = [];

  var otherObj = tree.get(currentPlayer,check);

  playerCollisions.forEach(collisionCheck);
}

function tickBullet(currentBullet){ // 프레임 당 총알 계산
  bulletUtil.moveBullet(currentBullet);

  currentBullet.lastHealth = currentBullet.health;

  function check(obj){ // 충돌했는가?
    if ((!obj.owner || obj.owner !== currentBullet.owner) && obj.id !== currentBullet.owner && obj.id !== currentBullet.id && currentBullet.isCollision == false && obj.isCollision == false){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(bulletCircle,
      new C(new V(obj.x,obj.y),obj.radius),response);

      if (collided){
        response.aUser = currentBullet;
        response.bUser = obj;
        bulletCollisions.push(response);
      }
    }

    return true;
  }

  function collisionCheck(collision){ // 충돌 시 계산
    let dir = Math.atan2(collision.aUser.y-collision.bUser.y,collision.aUser.x-collision.bUser.x);

    collision.aUser.isCollision = collision.bUser.isCollision = true;

    io.emit('objectHit',collision.aUser);
    io.emit('objectHit',collision.bUser);

    collision.aUser.dx+=Math.cos(dir) * 1;
    collision.aUser.dy+=Math.sin(dir) * 1;
    collision.bUser.dx-=Math.cos(dir) * 1;
    collision.bUser.dy-=Math.sin(dir) * 1;

    if (collision.bUser.lastHealth-collision.aUser.damage<=0){
      collision.aUser.health-=collision.bUser.damage*(collision.bUser.lastHealth/collision.aUser.damage);
    }
    else{
      collision.aUser.health-=collision.bUser.damage;
    }
    if (collision.aUser.lastHealth-collision.bUser.damage<=0){
      collision.bUser.health-=collision.aUser.damage*(collision.aUser.lastHealth/collision.bUser.damage);
    }
    else{
      collision.bUser.health-=collision.aUser.damage;
    }
  }

  var bulletCircle = new C(new V(currentBullet.x,currentBullet.y),currentBullet.radius);

  tree.clear();
  users.forEach(tree.put);
  bullets.forEach(tree.put);
  var bulletCollisions = [];

  var otherObj = tree.get(currentBullet,check);

  bulletCollisions.forEach(collisionCheck);

  currentBullet.time -= 1000/60; // 수명
}

function moveloop(){
  users.forEach((u) => {
    tickPlayer(u);
  });
  bullets.forEach((b) => {
    tickBullet(b);
  });
  users.forEach((u)=>{
    if (userUtil.isDeadPlayer(u,users))
      io.emit('objectDead',u);
  });
  bullets.forEach((b)=>{
    if (bulletUtil.isDeadBullet(b,bullets))
      io.emit('objectDead',b);
  });
}

function sendUpdates(){
  for (let key in sockets){
    sockets[key].emit('objectList',users,bullets);
  }
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);

server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
