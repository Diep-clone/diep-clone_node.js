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
const shapeUtil = require('./lib/shapeSet');

const quadtree = require('simple-quadtree'); // 쿼드 트리 (충돌 감지)
const readline = require('readline'); // 콘솔 창 명령어 실행 패키지

let V = SAT.Vector;
let C = SAT.Circle;

let users = {}; // 유저 목록.

let tanks = []; // 탱크 목록.
let bullets = []; // 총알 목록.
let shapes = []; // 도형 목록.

let objects = []; // 오브젝트 목록.

let sockets = {}; // 유저 접속 목록.

let mapSize = {x: 161.25,y: 161.25}; // 맵 크기.
let tankLength = 53; // 탱크의 목록 길이.

let tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 10 });

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
  let currentPlayer = { // 현재 플레이어 객체 생성.
    objType: 'player',
    id: socket.id, // 플레이어의 소켓 id
    rotate: null,
    mouse: {
      left: false,
      right: false
    },
    target: {
      x: 0,
      y: 0
    },
    camera: {
      x: 0,
      y: 0
    },
    k: false,
    o: false,
    name: "",
    changeTank: false,
    isChange: false,
    controlTank: null
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

      mapSize.x+= 161.25;
      mapSize.y+= 161.25;

      tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 10 });

      shapeUtil.extendMaxShape(10);

      sockets[socket.id] = socket;

      currentPlayer.name = name;

      currentPlayer.controlTank = {
        objType: 'tank',
        owner: socket.id,
        id: socket.id,
        x: util.randomRange(-mapSize.x,mapSize.x),
        y: util.randomRange(-mapSize.y,mapSize.y),
        w: 10,
        h: 10,
        dx: 0,
        dy: 0,
        level: 1,
        exp: 0,
        health: 48,
        maxHealth: 48,
        lastHealth: 48,
        damage: 20,
        radius: 12.9,
        rotate: 0,
        bound: 1,
        invTime: -1,
        opacity: 1,
        name: name,
        sight: 1.78,
        guns: [],
        stats: [0,0,0,8,8,8,8,0],
        maxStats: [8,8,8,8,8,8,8,8],
        stat: 0,
        type: 50,
        isCanDir: true,
        isCollision: false,
        hitTime: Date.now(),
        hitObject: null,
        isDead: false
      };

      userUtil.setUserTank(currentPlayer.controlTank);

      users[socket.id] = currentPlayer;
      tanks.push(currentPlayer.controlTank);

      currentPlayer.controlTank.radius = Math.round(12.9*Math.pow(1.01,(currentPlayer.controlTank.level-1))*10)/10;
      currentPlayer.controlTank.sight = userUtil.setUserSight(currentPlayer.controlTank);
      socket.emit('spawn', currentPlayer.controlTank);
      socket.emit('playerSet',{level:currentPlayer.controlTank.level,sight:currentPlayer.controlTank.sight,isRotate:currentPlayer.controlTank.isCanDir});
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

  socket.on('input', (data) => { // 입력 정보
    currentPlayer.rotate = data.moveRotate;
    currentPlayer.k = data.k;
    currentPlayer.mouse.right = data.rShot>0;
    currentPlayer.mouse.left = data.shot>0 || data.autoE;
    currentPlayer.o = data.o;
    currentPlayer.changeTank = data.changeTank;
    if (!data.changeTank && currentPlayer.isChange) currentPlayer.isChange = false;
  });

  socket.on('disconnect', () => { // 연결 끊김
    if (sockets[socket.id]){
      console.log('안녕 잘가!!!');
      mapSize.x-= 161.25;
      mapSize.y-= 161.25;

      tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 10 });

      shapeUtil.extendMaxShape(-10);

      delete users[socket.id];

      io.emit('mapSize', mapSize);
    }
  });
});

function collisionCheck(collision){ // 충돌 시 계산
  let dir = Math.atan2(collision.aUser.y-collision.bUser.y,collision.aUser.x-collision.bUser.x);

  collision.aUser.isCollision = collision.bUser.isCollision = true;

  collision.aUser.dx+=Math.cos(dir) * collision.aUser.bound;
  collision.aUser.dy+=Math.sin(dir) * collision.aUser.bound;
  collision.bUser.dx-=Math.cos(dir) * collision.bUser.bound;
  collision.bUser.dy-=Math.sin(dir) * collision.bUser.bound;

  if (collision.aUser.owner !== collision.bUser.owner){
    io.emit('objectHit',collision.aUser.id,collision.aUser.objType);
    io.emit('objectHit',collision.bUser.id,collision.bUser.objType);

    collision.aUser.hitTime = Date.now();
    collision.bUser.hitTime = Date.now();

    collision.aUser.hitObject = collision.bUser;
    collision.bUser.hitObject = collision.aUser;

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

function tickPlayer(currentPlayer){ // 프레임 당 유저(탱크) 계산
  let isMove = userUtil.moveUser(currentPlayer,mapSize,users[currentPlayer.id]);

  for (let i=0;i<currentPlayer.guns.length;i++){
    if (currentPlayer.guns[i].dir.rotate!==null){

    }
  }

  let tankBullets = bulletUtil.bulletSet(currentPlayer,users[currentPlayer.id]);

  bullets = bullets.concat(tankBullets[0]);

  if (!currentPlayer.isCanDir){
    currentPlayer.rotate+= 0.01;
  }

  if (tankBullets[1] || isMove || !users[currentPlayer.id] || currentPlayer.invTime===-1){
    currentPlayer.opacity=Math.min(currentPlayer.opacity+0.1,1);
  }
  else{
    currentPlayer.opacity=Math.max(currentPlayer.opacity-1/60/currentPlayer.invTime,0);
  }

  if (users[currentPlayer.id]){
    userUtil.healTank(currentPlayer);
    if (users[currentPlayer.id].k && currentPlayer.level<45){
      currentPlayer.level++;
      let healthPer = currentPlayer.health / currentPlayer.maxHealth;
      currentPlayer.maxHealth = 48 + currentPlayer.level * 2;
      currentPlayer.health = currentPlayer.maxHealth / healthPer;
      currentPlayer.radius = Math.round(12.9*Math.pow(1.01,(currentPlayer.level-1))*10)/10;
      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
      sockets[currentPlayer.id].emit('playerSet',{level:currentPlayer.level,sight:currentPlayer.sight,isRotate:currentPlayer.isCanDir});
    }
    if (users[currentPlayer.id].o){
      currentPlayer.health=0;
    }
    if (users[currentPlayer.id].changeTank && !users[currentPlayer.id].isChange){
      currentPlayer.type = currentPlayer.type==0?tankLength-1:currentPlayer.type-1;
      userUtil.setUserTank(currentPlayer);
      currentPlayer.sight = userUtil.setUserSight(currentPlayer);
      users[currentPlayer.id].isChange = true;
      sockets[currentPlayer.id].emit('playerSet',{level:currentPlayer.level,sight:currentPlayer.sight,isRotate:currentPlayer.isCanDir});
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

  var playerCircle = new C(new V(currentPlayer.x,currentPlayer.y),currentPlayer.radius);

  tree.clear();
  tanks.forEach(tree.put);
  bullets.forEach(tree.put);
  shapes.forEach(tree.put);
  var playerCollisions = [];

  var otherObj = tree.get(currentPlayer,check);

  playerCollisions.forEach(collisionCheck);
}

function tickBullet(currentBullet){ // 프레임 당 총알 계산
  bulletUtil.moveBullet(currentBullet,mapSize,users[currentBullet.owner],detectObject(currentBullet,500,0,Math.PI));

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

  var bulletCircle = new C(new V(currentBullet.x,currentBullet.y),currentBullet.radius);

  tree.clear();
  bullets.forEach(tree.put);
  shapes.forEach(tree.put);
  var bulletCollisions = [];

  tree.get(currentBullet,check);

  bulletCollisions.forEach(collisionCheck);

  if (currentBullet.time > 0) currentBullet.time = Math.max(currentBullet.time - 1000/60, 0); // 수명
}

function tickShape(currentShape){
  shapeUtil.moveShape(currentShape,mapSize,users[currentShape.owner],detectObject(currentShape,500,0,Math.PI));

  currentShape.lastHealth = currentShape.health;

  function check(obj){ // 충돌했는가?
    if (obj.id !== currentShape.id
    && (currentShape.isCollision === false || obj.isCollision === false)){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(shapeCircle,
      new C(new V(obj.x,obj.y),obj.radius),response);

      if (collided){
        response.aUser = currentShape;
        response.bUser = obj;
        shapeCollisions.push(response);
      }
    }

    return true;
  }

  var shapeCircle = new C(new V(currentShape.x,currentShape.y),currentShape.radius);

  tree.clear();
  shapes.forEach(tree.put);
  var shapeCollisions = [];

  tree.get(currentShape,check);

  shapeCollisions.forEach(collisionCheck);
}

function detectObject(object,r,rotate,dir){
  tree.clear();
  tanks.forEach(tree.put);
  shapes.forEach(tree.put);
  let collisionsObject = undefined;
  let dist = r+1;

  function check(obj){
    if (object.id !== obj.id && object.owner !== obj.id && (!obj.owner || obj.objType === "tank") && !obj.isDead){
      let response = new SAT.Response();
      let collided = SAT.testCircleCircle(new C(new V(object.x,object.y),r),
      new C(new V(obj.x,obj.y),obj.radius),response);
      if (collided){
        let angle = Math.atan2(obj.y-object.y,obj.x-object.x);
        let a = -((Math.cos(rotate)*Math.cos(angle)) + (Math.sin(rotate)*Math.sin(angle))-1) * Math.PI / 2;
        let dis = Math.sqrt((obj.x-object.x)*(obj.x-object.x)+(obj.y-object.y)*(obj.y-object.y));
        if (a<=dir && dist>dis){
          collisionsObject = obj;
          dist = dis;
        }
      }
    }

    return true;
  }

  tree.get(object,check);

  return collisionsObject;
}

function moveloop(){
  tanks.forEach((u) => {
    tickPlayer(u);
  });
  bullets.forEach((b) => {
    tickBullet(b);
  });
  shapes = shapes.concat(shapeUtil.spawnShape(mapSize));
  shapes.forEach((s) => {
    tickShape(s);
  });
  tanks.forEach((u)=>{
    if (userUtil.isDeadPlayer(u,tanks)){
      io.emit('objectDead',u.id,"tank");
    }
  });
  bullets.forEach((b)=>{
    if (bulletUtil.isDeadBullet(b,bullets)){
      io.emit('objectDead',b.id,"bullet");
    }
  });
  shapes.forEach((s)=>{
    if (shapeUtil.isDeadShape(s,shapes)){
      io.emit('objectDead',s.id,"shape");
    }
  });
}

function sendUpdates(){
//  console.time();
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
                    f.y < u.camera.y + u.screenHeight/2 + f.radius && (f.opacity > 0 || f.id === key)) {
                    return {
                      id:f.id,
                      x:util.floor(f.x,2),
                      y:util.floor(f.y,2),
                      radius:util.floor(f.radius,1),
                      rotate:util.floor(f.rotate,2),
                      health:util.floor(f.health,1),
                      maxHealth:util.floor(f.maxHealth,1),
                      opacity:util.floor(f.opacity,2),
                      type:f.type,
                      name:f.name
                    };
                }
            })
            .filter(function(f) { return f; });
    let visibleBullet  = bullets
            .map(function(f) {
                if ( f.x > u.camera.x - u.screenWidth/2 - f.radius &&
                    f.x < u.camera.x + u.screenWidth/2 + f.radius &&
                    f.y > u.camera.y - u.screenHeight/2 - f.radius &&
                    f.y < u.camera.y + u.screenHeight/2 + f.radius) {
                    return {
                      id:f.id,
                      x:util.floor(f.x,2),
                      y:util.floor(f.y,2),
                      radius:util.floor(f.radius,1),
                      rotate:util.floor(f.rotate,2),
                      type:f.type,
                      owner:f.owner
                    };
                }
            })
            .filter(function(f) { return f; });
    let visibleShape  = shapes
            .map(function(f) {
                if ( f.x > u.camera.x - u.screenWidth/2 - f.radius &&
                    f.x < u.camera.x + u.screenWidth/2 + f.radius &&
                    f.y > u.camera.y - u.screenHeight/2 - f.radius &&
                    f.y < u.camera.y + u.screenHeight/2 + f.radius) {
                    return {
                      id:f.id,
                      x:util.floor(f.x,2),
                      y:util.floor(f.y,2),
                      radius:util.floor(f.radius,1),
                      rotate:util.floor(f.rotate,2),
                      health:util.floor(f.health,1),
                      maxHealth:util.floor(f.maxHealth,1),
                      type:f.type
                    };
                }
            })
            .filter(function(f) { return f; });
    sockets[key].emit('objectList',visibleTank,visibleBullet,visibleShape);
  }
  //console.timeEnd();
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
