'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SAT = require('sat');
const io = require('socket.io')(server);
const os = require('os-utils');

io.set('heartbeat timeout', 60000);
io.set('heartbeat interval', 25000);

const util = require('./lib/librarys');
const objUtil = require('./lib/objectSet');
const userUtil = require('./lib/userSet');
const bulletUtil = require('./lib/bulletSet');

const quadtree = require('simple-quadtree'); // 쿼드 트리 (충돌 감지)
const readline = require('readline'); // 콘솔 창 명령어 실행 패키지

let tree;

let V = SAT.Vector;
let C = SAT.Circle;

let users = {}; // 유저 목록.
let tanks = []; // 탱크 목록.
let bullets = []; // 총알 목록.
let sockets = {}; // 유저 접속 목록.

let mapSize = {x: 0,y: 0}; // 맵 크기.
let tankLength = 53; // 탱크의 목록 길이.

app.use(express.static(__dirname + '/static')); // 클라이언트 코드 목록 불러오기.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var recursiveAsyncReadLine = function () {
  rl.question('Command: ', function (answer) {
    if (answer == 'exit') //we need some base case, for recursion
      return rl.close(); //closing RL and returning from function.
    eval(answer);
    recursiveAsyncReadLine(); //Calling this function again to ask new question
  });
};
recursiveAsyncReadLine();

io.on('connection', (socket) => { // 접속.

  mapSize.x+= 322.5;
  mapSize.y+= 322.5;

  tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

  let currentPlayer = { // 현재 플레이어 객체 생성.
    objType: 'player',
    id:socket.id, // 플레이어의 소켓 id
    rotate: null,
    mouse:"",
    target:{
      x:0,
      y:0
    },
    camera:{
      x:0,
      y:0
    },
    k:false,
    o:false,
    name:"",
    changeTank:false,
    isChange:false,
    controlTank:null
  };

  /*let currentTank = {
    objType: 'tank',
    id:socket.id,
    x:0,
    y:0,
    w:10,
    h:10,
    dx:0,
    dy:0,
    level:1,
    health:1,
    maxHealth:48,
    lastHealth:48,
    damage:20,
    radius:12.8,
    rotate:0,
    name:"",
    sight:1.78,
    guns:[],
    stats:[0,0,0,0,0,0,0,0],
    bulletCount:0,
    type:12,
    isCollision:false,
    hitTime:Date.now(),
    isDead:false
  };*/

  socket.on('login', (name) => { // 탱크 생성.
    if (sockets[socket.id]){
      console.log('넌 뭐야 저리가!!!');
      return false;
    }
    else{
      console.log('누군가가 들어왔다!!!');

      sockets[socket.id] = socket;

      currentPlayer.name = name;

      currentPlayer.controlTank = {
        objType: 'tank',
        id:socket.id,
        x:util.randomRange(-mapSize.x/2,mapSize.x/2),
        y:util.randomRange(-mapSize.y/2,mapSize.y/2),
        w:10,
        h:10,
        dx:0,
        dy:0,
        level:1,
        health:48,
        maxHealth:48,
        lastHealth:48,
        damage:20,
        radius:12.9,
        rotate:0,
        bound:1,
        invTime:-1,
        name:name,
        sight:1.78,
        guns:[],
        stats:[0,0,0,0,0,0,0,0],
        maxStats:[8,8,8,8,8,8,8,8],
        stat:0,
        type:39,
        isCanDir:true,
        isCollision:false,
        hitTime:Date.now(),
        isDead:false
      };

      userUtil.setUserTank(currentPlayer.controlTank);

      users[socket.id] = currentPlayer;
      tanks.push(currentPlayer.controlTank);

      currentPlayer.controlTank.sight = userUtil.setUserSight(currentPlayer.controlTank);
      socket.emit('spawn', currentPlayer.controlTank);
      io.emit('mapSize', mapSize);
    }
  });

  socket.on('ping!', (data) => {
    socket.emit('pong!',data);
  });

  socket.on('mousemove', (data) => { // 마우스 좌표, 탱크의 방향
    if (data == null ) return; // null 값을 받으면 서버 정지

    currentPlayer.target = data;

    if (currentPlayer.controlTank && currentPlayer.controlTank.isCanDir){
      currentPlayer.controlTank.rotate = Math.atan2(data.y-currentPlayer.controlTank.y,data.x-currentPlayer.controlTank.x);
    }
  });

  socket.on('windowResized', (data) => {
    currentPlayer.screenWidth = data.screenWidth;
    currentPlayer.screenHeight = data.screenHeight;
  });

  socket.on('levelUP', () => {
    if (currentPlayer.controlTank && currentPlayer.controlTank.level<45){

    }
  });

  socket.on('input', (data) => { // 입력 정보
    currentPlayer.rotate = data.moveRotate;
    currentPlayer.k = data.k;
    if (data.rShot>0) currentPlayer.mouse = "right";
    else if (data.shot>0 || data.autoE) currentPlayer.mouse = "left";
    else currentPlayer.mouse = "";
    currentPlayer.o = data.o;
    currentPlayer.changeTank = data.changeTank;
    if (!data.changeTank && currentPlayer.isChange) currentPlayer.isChange = false;
  });

  socket.on('disconnect', () => { // 연결 끊김
    console.log('안녕 잘가!!!');
    mapSize.x-= 322.5;
    mapSize.y-= 322.5;

    tree = quadtree(-mapSize.x/2,-mapSize.y/2,mapSize.x/2,mapSize.y/2);

    delete users[socket.id];

    io.emit('mapSize', mapSize);
  });
});

function tickPlayer(currentPlayer){ // 프레임 당 유저(탱크) 계산
  userUtil.moveUser(currentPlayer,mapSize,users[currentPlayer.id]);
  bullets = bullets.concat(bulletUtil.bulletSet(currentPlayer,users[currentPlayer.id]));

  if (!currentPlayer.isCanDir){
    currentPlayer.rotate+= 0.01;
  }

  if (users[currentPlayer.id]){
    objUtil.healObject(currentPlayer);
    if (users[currentPlayer.id].k && currentPlayer.level<45){
      currentPlayer.level++;
      currentPlayer.radius = Math.round(12.9*Math.pow(1.01,(currentPlayer.level-1))*10)/10;
      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
    }
    if (users[currentPlayer.id].o){
      currentPlayer.health=0;
    }
    if (users[currentPlayer.id].changeTank && !users[currentPlayer.id].isChange){
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
      userUtil.setUserTank(currentPlayer);
      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
      users[currentPlayer.id].isChange = true;
    }
  }
  else userUtil.afkTank(currentPlayer);

  currentPlayer.lastHealth = currentPlayer.health; // lastHealth 는 데미지 계산 당시에 사용할 이전 체력 값이다. 이 값이 없다면 데미지 계산을 제대로 하지 못한다.

  function check(obj){ // 충돌했는가?
    if ((!obj.owner || obj.owner !== currentPlayer.id) && obj.id !== currentPlayer.id && (currentPlayer.isCollision === false || obj.isCollision === false)){
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

    collision.aUser.hitTime = Date.now();
    collision.bUser.hitTime = Date.now();

    collision.aUser.dx+=Math.cos(dir) * collision.aUser.bound;
    collision.aUser.dy+=Math.sin(dir) * collision.aUser.bound;
    collision.bUser.dx-=Math.cos(dir) * collision.bUser.bound;
    collision.bUser.dy-=Math.sin(dir) * collision.bUser.bound;

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
  tanks.forEach(tree.put);
  bullets.forEach(tree.put);
  var playerCollisions = [];

  var otherObj = tree.get(currentPlayer,check);

  playerCollisions.forEach(collisionCheck);
}

function tickBullet(currentBullet){ // 프레임 당 총알 계산
  bulletUtil.moveBullet(currentBullet,mapSize,users[currentBullet.owner],detectObject(currentBullet,92.88));
  currentBullet.lastHealth = currentBullet.health;

  function check(obj){ // 충돌했는가?
    if ((!obj.owner || obj.owner !== currentBullet.owner || (obj.isOwnCol && currentBullet.isOwnCol))
    && obj.id !== currentBullet.owner
    && obj.id !== currentBullet.id
    && (currentBullet.isCollision === false || obj.isCollision === false)){
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

    collision.aUser.dx+=Math.cos(dir) * collision.aUser.bound;
    collision.aUser.dy+=Math.sin(dir) * collision.aUser.bound;
    collision.bUser.dx-=Math.cos(dir) * collision.bUser.bound;
    collision.bUser.dy-=Math.sin(dir) * collision.bUser.bound;

    if (collision.aUser.owner !== collision.bUser.owner){

      io.emit('objectHit',collision.aUser);
      io.emit('objectHit',collision.bUser);

      collision.aUser.hitTime = Date.now();
      collision.bUser.hitTime = Date.now();

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
  }

  var bulletCircle = new C(new V(currentBullet.x,currentBullet.y),currentBullet.radius);

  tree.clear();
  bullets.forEach(tree.put);
  var bulletCollisions = [];

  tree.get(currentBullet,check);

  bulletCollisions.forEach(collisionCheck);

  if (currentBullet.time > 0) currentBullet.time = Math.max(currentBullet.time - 1000/60, 0); // 수명
}

function detectObject(object,r){
  tree.clear();
  tanks.forEach(tree.put);
  let collisionsObjectList = [];
  let dist = [];

  function check(obj){
    if (obj.id !== object.owner){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(new C(new V(object.x,object.y),r),
      new C(new V(obj.x,obj.y),obj.radius),response);

      if (collided){
        collisionsObjectList.push(obj);
        dist.push(Math.sqrt((obj.x-object.x)*(obj.x-object.x)+(obj.y-object.y)*(obj.y-object.y)));
      }
    }

    return true;
  }

  tree.get(object,check);

  let min = r+1;
  let obj = undefined;

  for (let i=0;i<dist.length;i++){
    if (dist[i]<min){
      min=dist[i];
      obj=collisionsObjectList[i];
    }
  }

  return obj;
}

function moveloop(){
  tanks.forEach((u) => {
    tickPlayer(u);
  });

  bullets.forEach((b) => {
    tickBullet(b);
  });
  tanks.forEach((u)=>{
    if (userUtil.isDeadPlayer(u,tanks)){
      io.emit('objectDead',u);
    }
  });
  bullets.forEach((b)=>{
    if (bulletUtil.isDeadBullet(b,bullets))
      io.emit('objectDead',b);
  });
}

function sendUpdates(){
  for (let key in users){
    if (users[key].controlTank){
      users[key].camera.x = users[key].controlTank.x;
      users[key].camera.y = users[key].controlTank.y;
    }
    let u = users[key];
    let visibleTank  = tanks
            .map(function(f) {
                if ( f.x > u.camera.x - u.screenWidth/2 - f.radius &&
                    f.x < u.camera.x + u.screenWidth/2 + f.radius &&
                    f.y > u.camera.y - u.screenHeight/2 - f.radius &&
                    f.y < u.camera.y + u.screenHeight/2 + f.radius) {
                    return f;
                }
            })
            .filter(function(f) { return f; });
    let visibleBullet  = bullets
            .map(function(f) {
                if ( f.x > u.camera.x - u.screenWidth/2 - f.radius &&
                    f.x < u.camera.x + u.screenWidth/2 + f.radius &&
                    f.y > u.camera.y - u.screenHeight/2 - f.radius &&
                    f.y < u.camera.y + u.screenHeight/2 + f.radius) {
                    return f;
                }
            })
            .filter(function(f) { return f; });
    sockets[key].emit('objectList',visibleTank,visibleBullet);
  }
}

setInterval(moveloop,1000/60);
setInterval(sendUpdates,1000/40);
/*
setInterval(function(){
  os.cpuUsage(function(v){
    console.log( 'CPU Usage (%): ' + v );
  });
},2000);
*/
server.listen(process.env.PORT || 3000, () => {
    console.log("잠깐, 지금 서버를 연거야?");
});
