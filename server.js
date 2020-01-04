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

let users = []; // 유저 목록. 탱크의 정보와 똑같다.
let bullets = []; // 총알 목록.
let bulletId = 0; // 총알 고유 아이디.
let sockets = {}; // 유저 접속 목록.

let mapSize = {x: 0,y: 0}; // 맵 크기.
let tankLength = 11; // 탱크의 목록 길이. 지금은 Basic 부터 Destroyer 까지 총 11개다.

app.use(express.static(__dirname + '/static')); // 클라이언트 코드 목록 불러오기.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

function findIndex(arr,id){ // 배열에서 id 가 똑같은 인덱스 찾기
  let len = arr.length;

  while (len--){
    if (arr[len].id === id)
      return len;
  }
  return -1;
}

function randomRange (x,y){ // x~y 사이의 랜덤 난수 생성.
  if (x>y){
    let im = x;
    x=y;
    y=im;
  }
  return Math.random() * (y-x) + x;
}

function setGun(user){ // 유저 총구 설정.
  switch(user.type){
    case 0:
      user.guns = [{
        bulletType:1,
        speed:1,
        damage:1,
        health:1,
        radius:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.8},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
    break;
    default:
    break;
  }
}

io.on('connection', (socket) => { // 접속.

  mapSize.x+= 322.5;
  mapSize.y+= 322.5;

  tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

  let index;

  let currentPlayer = { // 현재 플레이 객체 생성.
    id:socket.id,
    x:0,
    y:0,
    w:10,
    h:10,
    dx:0,
    dy:0,
    health:48,
    maxHealth:48,
    lastHealth:48,
    damage:20,
    radius:13.5,
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
      life:int,
      pos:{x:%,y:%},
      dir:{rotate:pi,distance:%}
    }
    */
    stats:[0,0,0,0,0,0,0,0],
    type:0,
    isCollision:false,
  };

  socket.on('login', (player) => { // 탱크 생성.
    if (sockets[socket.id]){
      console.log('넌 뭐야 저리가!!!');
      return false;
    }
    else{
      console.log('누군가가 들어왔다!!!');

      sockets[socket.id] = socket;

      currentPlayer.x = randomRange(-mapSize.x/2,mapSize.x/2);
      currentPlayer.y = randomRange(-mapSize.y/2,mapSize.y/2);
      setGun(currentPlayer);

      index = users.length;
      users.push(currentPlayer);

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

  socket.on('input', (data) => { // 입력 정보
    currentPlayer.moveRotate = data.moveRotate;
    currentPlayer.mouse.left = data.shot>0;
    if (data.o){
      if (findIndex(users,currentPlayer.id) > -1){
        users.splice(findIndex(users,currentPlayer.id),1);
        io.emit('objectDead','tank',currentPlayer);
      }
    }
    if (data.changeTank){
      console.log(currentPlayer.health);
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
      setGun(currentPlayer);
    }
  });

  socket.on('disconnect', () => { // 연결 끊김
    console.log('안녕 잘가!!!');
    mapSize.x-= 322.5;
    mapSize.y-= 322.5;

    tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

    if (findIndex(users,currentPlayer.id) > -1){
      users.splice(findIndex(users,currentPlayer.id),1);
      io.emit('objectDead','tank',currentPlayer);
    }
    io.emit('mapSize', mapSize);
  });
});

function moveObject(obj){ // 오브젝트의 움직임
  obj.x+=obj.dx;
  obj.y+=obj.dy;
  obj.dx*=0.97;
  obj.dy*=0.97;
}

function moveBullet(b){ // 총알의 움직임
  switch(b.type){
    case 1:
      b.dx+=Math.cos(b.rotate) * 0.07 * b.speed;
      b.dy+=Math.sin(b.rotate) * 0.07 * b.speed;
    break;
    default:
    break;
  }
  moveObject(b);
}

function movePlayer(u){ // 유저(탱크)의 움직임
  if (u.moveRotate!=null && !isNaN(u.moveRotate)){
    u.dx+=Math.cos(u.moveRotate) * 0.07;
    u.dy+=Math.sin(u.moveRotate) * 0.07;
  }
  moveObject(u);
  if (u.x>mapSize.x+51.6) u.x=mapSize.x+51.6;
  if (u.x<-mapSize.x-51.6) u.x=-mapSize.x-51.6;
  if (u.y>mapSize.y+51.6) u.y=mapSize.y+51.6;
  if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
}

function bulletSet(user){ // 유저의 총알 발사
  for (let i=0;i<user.guns.length;i++){
    if ((user.mouse.left || user.guns[i].autoShot) && user.guns[i].shotTime < 0){
      let rotate = user.guns[i].dir.rotate===null?user.rotate:user.guns[i].dir.rotate;
      bullets.push({
        type: user.guns[i].bulletType,
        id: bulletId++,
        owner: user.id,
        x: user.x + Math.cos(user.rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.cos(user.rotate) * user.guns[i].pos.y * user.radius,
        y: user.y + Math.sin(user.rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.sin(user.rotate) * user.guns[i].pos.y * user.radius,
        w: 10,
        h: 10,
        rotate: rotate,
        dx: Math.cos(rotate) * 4 * user.guns[i].speed,
        dy: Math.sin(rotate) * 4 * user.guns[i].speed,
        speed: 0.8 * user.guns[i].speed,
        health: 8 * user.guns[i].health,
        maxHealth: 8 * user.guns[i].health,
        lastHealth: 8 * user.guns[i].health,
        damage: 7 * user.guns[i].damage,
        radius: 5.5 * user.guns[i].radius,
        time: 1000 * user.guns[i].life,
        isCollision: false
      });
      user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) * user.guns[i].coolTime * 1000;
    }
    if (user.guns[i].shotTime >= 0) user.guns[i].shotTime -= 1000/60;
  }
}

function tickPlayer(currentPlayer){ // 프레임 당 유저(탱크) 계산
  movePlayer(currentPlayer);
  bulletSet(currentPlayer);

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

    collision.aUser.dx+=Math.cos(dir) * 1;
    collision.aUser.dy+=Math.sin(dir) * 1;

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
  moveBullet(currentBullet);

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

    collision.aUser.dx+=Math.cos(dir) * 1;
    collision.aUser.dy+=Math.sin(dir) * 1;

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

function isDeadPlayer(obj){ // 죽었는가?
  obj.isCollision = false;
  if (obj.health <= 0){
    if (findIndex(users,obj.id) > -1){
      users.splice(findIndex(users,obj.id),1);
      io.emit('objectDead','tank',obj);
    }
  }
}

function isDeadBullet(obj){ // 죽었는가?
  obj.isCollision = false;
  if (obj.time <= 0 || obj.health <= 0){
    if (findIndex(bullets,obj.id) > -1){
      bullets.splice(findIndex(bullets,obj.id),1);
      io.emit('objectDead','bullet',obj);
    }
  }
}

function moveloop(){
  users.forEach((u) => {
    tickPlayer(u);
  });
  bullets.forEach((b) => {
    tickBullet(b);
  });
  users.forEach((u)=>{
    isDeadPlayer(u);
  });
  bullets.forEach((b)=>{
    isDeadBullet(b);
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
