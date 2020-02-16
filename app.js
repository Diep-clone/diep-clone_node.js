'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SAT = require('sat');
const io = require('socket.io')(server);
const os = require('os-utils');

io.set('heartbeat timeout', 60000);
io.set('heartbeat interval', 25000);

const util = require('./lib/utility');
const objUtil = require('./lib/objectSet');
const userUtil = require('./lib/userSet');
const bulletUtil = require('./lib/bulletSet');
const shapeUtil = require('./lib/shapeSet');

const quadtree = require('./lib/QuadTree');
//const quadtree = require('simple-quadtree'); // 쿼드 트리 (충돌 감지)
const readline = require('readline'); // 콘솔 창 명령어 실행 패키지

let V = SAT.Vector;
let C = SAT.Circle;

var gameSet = {
  gameMode: "sandbox",
  maxPlayer: 50,
  mapSize: {x: 322.5,y: 322.5}
};

let users = []; // 유저 목록.
var objects = []; // 오브젝트 목록.
var objID = (function(){ var id=1; return function(){ return id++;} })();

let sockets = {}; // 유저 접속 목록.

let tankLength = 53; // 탱크의 목록 길이.

//let tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 25 });
//let tree = new QuadTree(new Box(-gameSet.mapSize.x,-gameSet.mapSize.y,gameSet.mapSize.x,gameSet.mapSize.y));

app.use(express.static(__dirname + '/static')); // 클라이언트 코드 목록 불러오기.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
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
    id: socket.id, // 플레이어의 소켓 id
    moveRotate: null,
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
      y: 0,
      z: 1
    },
    k: false,
    o: false,
    changeTank: false,
    controlObject: null
  };
  //gameSet.mapSize.x+= 161.25;
  //gameSet.mapSize.y+= 161.25;

  shapeUtil.extendMaxShape(10);

  //tree = new QuadTree(new Box(-gameSet.mapSize.x,-gameSet.mapSize.y,gameSet.mapSize.x,gameSet.mapSize.y));

  io.emit('mapSize', gameSet.mapSize);

  socket.on('login', (name) => { // 탱크 생성.
    if (sockets[socket.id]){
      console.log('넌 뭐야 저리가!!!');
      return false;
    }
    else{
      if (name.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length > 15) {
        name = '';
        console.log('앗 무지개 방패로 이름 공격을 막았어요 :)');
      }
      console.log('누군가가 들어왔다!!!');
      //tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 25 });
      sockets[socket.id] = socket;

      let obj = {
        objType: 'tank', // 오브젝트 타입. tank, bullet, drone, shape, boss 총 5가지가 있다.
        type: 12, // 오브젝트의 종류값.
        owner: currentPlayer, // 오브젝트의 부모.
        id: objID(), // 오브젝트의 고유 id.
        team: -1, // 오브젝트의 팀값.
        x: util.randomRange(-gameSet.mapSize.x,gameSet.mapSize.x), // 오브젝트의 좌표값.
        y: util.randomRange(-gameSet.mapSize.y,gameSet.mapSize.y),
        dx: 0.0, // 오브젝트의 속도값.
        dy: 0.0,
        level: 1, // 오브젝트의 레벨값.
        exp: 0, // 오브젝트의 경험치값.
        speed: function (){return (0.07 + (0.007 * obj.stats[7])) * Math.pow(0.985,obj.level-1);}, // (0.07+(0.007*speedStat))*0.0985^(level-1)
        healthPer: 1, // 오브젝트의 이전 프레임 체력 비율값.
        health: 50, // 오브젝트의 체력값.
        maxHealth: function (){return 48 + obj.level * 2 + obj.stats[1] * 20;}, // 48+level*2+maxHealthStat*20
        lastHealth: 48, // 오브젝트의 이전 프레임 체력값.
        lastMaxHealth: 50, // 오브젝트의 이전 프레임 최대체력값.
        damage: function (){return 20 + obj.stats[2] * 4;}, // 20+bodyDamageStat*4
        radius: function (){return 13*Math.pow(1.01,(obj.level-1));}, // 12.9*1.01^(level-1)
        rotate: 0, // 오브젝트의 방향값.
        bound: 1, // 오브젝트의 반동값.
        invTime: -1, // 오브젝트의 은신에 걸리는 시간.
        opacity: 1, // 오브젝트의 투명도값.
        name: name, // 오브젝트의 이름값.
        sight: function (){return userUtil.setUserSight(obj);}, // 오브젝트의 시야값.
        guns: [], // 오브젝트의 총구 목록.
        stats: [0,0,0,0,0,0,0,0], // 오브젝트의 스탯값.
        maxStats: [7,7,7,7,7,7,7,7], // 오브젝트의 최대 스탯값.
        stat: 0, // 오브젝트의 남은 스탯값.
        spawnTime: Date.now(), // 오브젝트의 스폰 시각.
        hitTime: Date.now(), // 오브젝트의 피격 시각.
        deadTime: -1, // 오브젝트의 죽은 시각.
        hitObject: null, // 오브젝트의 피격 오브젝트.
        moveAi: null, // 오브젝트의 이동 AI. 플레이어의 조종권한이 없을 때 실행하는 함수입니다.
        event:{ // 여기 있는 값들은 모두 "함수" 입니다.

        },
        variable:{

        },
        isBorder : true, // 오브젝트가 맵 밖을 벗어날 수 없는가?
        isCanDir: true, // 오브젝트의 방향을 조정할 수 있나?
        isCollision: false, // 오브젝트가 충돌계산을 마쳤나?
        isDead: false, // 오브젝트가 죽었나?
        isShot: false,
        isMove: false // 오브젝트가 현재 움직이는가?
      };
      obj.team = obj.id;

      currentPlayer.controlObject = obj;

      userUtil.setUserTank(currentPlayer.controlObject);

      users.push(currentPlayer);
      objects.push(currentPlayer.controlObject);
      socket.emit('spawn', {
        id:currentPlayer.controlObject.id,
        x:util.floor(currentPlayer.controlObject.x,2),
        y:util.floor(currentPlayer.controlObject.y,2),
        type:currentPlayer.controlObject.type,
        name:currentPlayer.controlObject.name,
        sight:util.floor(util.isF(currentPlayer.controlObject.sight),2)
      });
      socket.emit('mapSize', gameSet.mapSize);
    }
  });

  socket.on('ping!', (data) => {
    if (!data) return;
    socket.emit('pong!',data);
  });

  socket.on('mousemove', (data) => { // 마우스 좌표, 탱크의 방향
    if (!data) return; // null 값을 받으면 서버 정지
    if (currentPlayer.controlObject){
      currentPlayer.target.x = data.x - currentPlayer.controlObject.x;
      currentPlayer.target.y = data.y - currentPlayer.controlObject.y;
    }
  });
/*
  socket.on('windowResized', (data) => {
    if (!data) return;
    currentPlayer.screenWidth = data.screenWidth;
    currentPlayer.screenHeight = data.screenHeight;
  });
*/
  socket.on('leftMouse', (data) => {
    currentPlayer.mouse.left = data;
  });

  socket.on('rightMouse', (data) => {
    if (currentPlayer.controlObject && currentPlayer.controlObject.event){
      if (!currentPlayer.mouse.right && data) currentPlayer.controlObject.event.rightDownEvent();
      if (currentPlayer.mouse.right && !data) currentPlayer.controlObject.event.rightUpEvent();
    }
    currentPlayer.mouse.right = data;
  });

  socket.on('moveRotate', (data) => {
    currentPlayer.moveRotate = data;
  });

  socket.on('keyK', (data) => {
    currentPlayer.k = data;
  });

  socket.on('keyO', (data) => {
    currentPlayer.o = data;
  });

  socket.on('changeTank', (data) => {
    currentPlayer.changeTank = data;
  });

  socket.on('stat', (num) => {
    if (currentPlayer.controlObject && currentPlayer.controlObject.stat>0 && currentPlayer.controlObject.stats[num]<currentPlayer.controlObject.maxStats[num]){
      currentPlayer.controlObject.stats[num]++;
      currentPlayer.controlObject.stat--;
    }
  });

  socket.on('disconnect', () => { // 연결 끊김
    if (sockets[socket.id]){
      console.log('안녕 잘가!!!');
      //gameSet.mapSize.x-= 161.25;
      //gameSet.mapSize.y-= 161.25;

      //tree = quadtree(-mapSize.x,-mapSize.y,mapSize.x,mapSize.y,{ maxchildren: 25 });
      //tree = new QuadTree(new Box(-gameSet.mapSize.x,-gameSet.mapSize.y,gameSet.mapSize.x,gameSet.mapSize.y));

      shapeUtil.extendMaxShape(-10);

      currentPlayer.controlObject.owner = null;
      users.splice(util.findIndex(users,currentPlayer.id),1);

      io.emit('mapSize', gameSet.mapSize);
    }
  });
});

function collisionCheck(collision){ // 충돌 시 계산
  let dir = Math.atan2(collision.aUser.y-collision.bUser.y,collision.aUser.x-collision.bUser.x);

  if (collision.aUser === collision.bUser.owner || collision.bUser === collision.aUser.owner) return;

  collision.aUser.dx+=Math.cos(dir) * collision.aUser.bound;
  collision.aUser.dy+=Math.sin(dir) * collision.aUser.bound;
  collision.bUser.dx-=Math.cos(dir) * collision.bUser.bound;
  collision.bUser.dy-=Math.sin(dir) * collision.bUser.bound;

  if (collision.aUser.team === collision.bUser.team) return;

  io.emit('objectHit',collision.aUser.id,collision.aUser.objType);
  io.emit('objectHit',collision.bUser.id,collision.bUser.objType);

  collision.aUser.hitTime = Date.now();
  collision.bUser.hitTime = Date.now();

  collision.aUser.hitObject = collision.bUser;
  collision.bUser.hitObject = collision.aUser;

  if (collision.bUser.lastHealth-util.isF(collision.aUser.damage)<=0){
    collision.aUser.health-=util.isF(collision.bUser.damage)*(collision.bUser.lastHealth/util.isF(collision.aUser.damage));
  }
  else{
    collision.aUser.health-=util.isF(collision.bUser.damage);
  }
  if (collision.aUser.lastHealth-util.isF(collision.bUser.damage)<=0){
    collision.bUser.health-=util.isF(collision.aUser.damage)*(collision.aUser.lastHealth/util.isF(collision.bUser.damage));
  }
  else{
    collision.bUser.health-=util.isF(collision.aUser.damage);
  }
}

function tickPlayer(p){ // 플레이어를 기준으로 반복되는 코드입니다.
  if (p.controlObject && !p.controlObject.isDead){
    p.camera.x = p.controlObject.x;
    p.camera.y = p.controlObject.y;

    if (p.controlObject.sight)
      p.camera.z = util.isF(p.controlObject.sight);
    else
      p.camera.z = 1;
    if (p.controlObject.event){
      if (p.controlObject.event.rightEvent && p.mouse.right){
        p.controlObject.event.rightEvent();
      }
    }
    if (p.moveRotate === null){
      p.controlObject.isMove = false;
    }
    else{
      p.controlObject.dx += Math.cos(p.moveRotate) * util.isF(p.controlObject.speed);
      p.controlObject.dy += Math.sin(p.moveRotate) * util.isF(p.controlObject.speed);
      p.controlObject.isMove = true;
    }
    if (p.controlObject.isCanDir){
      p.controlObject.rotate = Math.atan2(p.target.y,p.target.x);
    }

    if (gameSet.gameMode === "sandbox"){
      if (p.o){
        p.controlObject.hitObject = p.controlObject;
        p.controlObject.health=0;
      }
    }
  }
}

function tickObject(obj){
  objUtil.moveObject(obj);

  if (obj.isBorder){ // 화면 밖으로 벗어나는가?
    if (obj.x>gameSet.mapSize.x+51.6) obj.x=gameSet.mapSize.x+51.6;
    if (obj.x<-gameSet.mapSize.x-51.6) obj.x=-gameSet.mapSize.x-51.6;
    if (obj.y>gameSet.mapSize.y+51.6) obj.y=gameSet.mapSize.y+51.6;
    if (obj.y<-gameSet.mapSize.y-51.6) obj.y=-gameSet.mapSize.y-51.6;
  }
  if (obj.health<=0){
    obj.isDead = true;
  }
  if (obj.isDead) return;
  if (obj.guns){
    bulletUtil.gunSet(objects,obj,objID,io);
  }
  if (obj.moveAi){
    obj.moveAi(obj);
  }

  switch (obj.objType){
    case "tank":
    let sc = userUtil.setUserLevel(obj);
    if (!obj.isCanDir){ // 방향 조정이 불가능할 때 방향 회전
      obj.rotate += 0.02;
    }
    if (obj.lastMaxHealth !== util.isF(obj.maxHealth)){
      obj.healthPer = obj.health / obj.lastMaxHealth;
      obj.health = util.isF(obj.maxHealth) / obj.healthPer;
      obj.lastMaxHealth = util.isF(obj.maxHealth);
    }
    if (obj.owner){
      if (gameSet.gameMode === "sandbox"){
        if (obj.owner.k && obj.level<45){
          obj.exp = sc;
        }
        if (obj.owner.changeTank){
          obj.type = obj.type==0?tankLength-1:obj.type-1;
          userUtil.setUserTank(obj);
          obj.owner.changeTank = false;
        }
      }
      userUtil.healTank(obj);
    }
    else{
      userUtil.afkTank(obj);
    }
    break;
    case "bullet":
    obj.time-=1000/60;
    obj.isOwnCol=Math.max(obj.isOwnCol-1000/60,0);
    if (obj.time<=0){
      obj.isDead = true;
    }
    break;
    case "drone":
    break;
    case "shape":
    objUtil.healObject(obj);
    break;
    default:
    break;
  }

  if (obj.isMove || obj.isShot || obj.invTime<0){
    obj.opacity=Math.min(obj.opacity+0.1,1);
  }
  else{
    obj.opacity=Math.max(obj.opacity-1/60/obj.invTime,0);
  }

  obj.lastHealth = obj.health; // lastHealth 는 데미지 계산 당시에 사용할 이전 체력 값이다. 이 값이 없다면 데미지 계산을 제대로 하지 못한다.
}

function moveloop(){
  users.forEach((u) => {
    tickPlayer(u);
  });
  shapeUtil.spawnShape(objects,gameSet.mapSize,objID);
  objects.forEach((o) => {
    tickObject(o);
  });
  objects.forEach((o) => {
    if (o.isDead){
      if (o.deadTime===-1){
        if (o.hitObject && o.hitObject.event){
          if (o.hitObject.event.killEvent) o.hitObject.event.killEvent(o);
        }
        if (o.event){
          if (o.event.deadEvent) o.event.deadEvent(o.hitObject);
        }
        o.deadTime=1000;
        for (let i=0;i<o.guns.length;i++){
          if (!o.guns[i]) continue;
          for (let j=0;j<o.guns[i].bullets.length;j++){
            o.guns[i].bullets[j].isDead = true;
          }
        }
      }
      else if (o.deadTime<0){
        objects.splice(util.findIndex(objects,o.id),1);
      }
      else{
        o.deadTime-=1000/60;
      }
    }
  });
}

function sendUpdates(){
  users.forEach((u) => {
    let visibleObject  = objects
            .map(function(f) {
                if ( f.x > u.camera.x - 1280 / u.camera.z - util.isF(f.radius) &&
                    f.x < u.camera.x + 1280 / u.camera.z + util.isF(f.radius) &&
                    f.y > u.camera.y - 720 / u.camera.z - util.isF(f.radius) &&
                    f.y < u.camera.y + 720 / u.camera.z + util.isF(f.radius) && f.opacity > 0) {
                    switch (f.objType){
                      case "tank":
                      return {
                        objType:"tank",
                        id:f.id,
                        x:util.floor(f.x,2),
                        y:util.floor(f.y,2),
                        radius:util.floor(util.isF(f.radius),1),
                        rotate:util.floor(f.rotate,2),
                        maxHealth:util.floor(f.lastMaxHealth,1),
                        health:util.floor(f.health,1),
                        opacity:util.floor(f.opacity,2),
                        type:f.type,
                        score:f.exp,
                        name:f.name,
                        isDead:f.isDead
                      };
                      case "bullet":
                      case "drone":
                      return {
                        objType:f.objType,
                        id:f.id,
                        x:util.floor(f.x,2),
                        y:util.floor(f.y,2),
                        radius:util.floor(util.isF(f.radius),1),
                        rotate:util.floor(f.rotate,2),
                        type:f.type,
                        owner:f.owner.id,
                        isDead:f.isDead
                      };
                      case "shape":
                      return {
                        objType:"shape",
                        id:f.id,
                        x:util.floor(f.x,2),
                        y:util.floor(f.y,2),
                        radius:util.floor(util.isF(f.radius),1),
                        rotate:util.floor(f.rotate,2),
                        maxHealth:util.floor(util.isF(f.maxHealth),1),
                        health:util.floor(f.health,1),
                        type:f.type,
                        isDead:f.isDead
                      };
                      default:
                      return {};
                    }
                }
            })
            .filter(function(f) { return f; });
    sockets[u.id].emit('objectList',visibleObject);
    sockets[u.id].emit('playerSet',{
      level:u.controlObject.level,
      camera:u.camera,
      isRotate:u.controlObject.isCanDir,
      stat:u.controlObject.stat,
      stats:u.controlObject.stats,
      maxStats:u.controlObject.maxStats
    });
  });
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
