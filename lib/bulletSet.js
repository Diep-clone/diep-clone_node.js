'use strict';

const util = require('./utility');
const utilObj = require('./objectSet');

let bulletId = 0; // 총알 고유 아이디.

exports.gunSet = function(objects,user,objID){
  user.isShot = false;
  for (let i=0;i<user.guns.length;i++){
    for (let j=0;j<user.guns[i].bullets.length;j++){
      if (user.guns[i].bullets[j].isDead){
        user.guns[i].bullets.splice(j--,1);
      }
    }
    if (user.owner && user.owner.mouse.left || user.guns[i].autoShot){
      if (user.owner && user.owner.mouse.left) user.isShot = true;
      user.guns[i].clickTime += 1000/60;
      let object = null;
      switch (user.guns[i].gunType){
        case "basic":
          if (user.guns[i].shotTime <= 0  && user.guns[i].shotPTime < user.guns[i].clickTime/((0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000)){
            let rotate = user.rotate+user.guns[i].rotate+util.randomRange(-user.guns[i].rotateDistance,user.guns[i].rotateDistance);
            let bulletOwner = (user.guns[i].owner)?user.guns[i].owner:user;
            object = {
              objType: 'bullet',
              type: user.guns[i].bulletType,
              owner: bulletOwner,
              id: objID(),
              team: bulletOwner.team,
              x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * util.isF(user.radius) + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * util.isF(user.radius),
              y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * util.isF(user.radius) + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * util.isF(user.radius),
              rotate: rotate,
              dx: Math.cos(rotate) * (3.2 + 0.2 * bulletOwner.stats[3]) * user.guns[i].speed,
              dy: Math.sin(rotate) * (3.2 + 0.2 * bulletOwner.stats[3]) * user.guns[i].speed,
              speed: (0.056 + 0.01 * bulletOwner.stats[3]) * user.guns[i].speed,
              health: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              maxHealth: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              lastHealth: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              damage: (7 + 3 * bulletOwner.stats[5]) * user.guns[i].damage,
              radius: 0.4 * user.guns[i].radius * util.isF(bulletOwner.radius),
              bound: user.guns[i].bulletBound,
              invTime: -1,
              opacity: 1,
              moveAi: user.guns[i].bulletAi,
              spawnTime: Date.now(),
              hitTime: Date.now(),
              time: 1000 * user.guns[i].life,
              hitObject: null,
              isBorder : false,
              isCollision: false,
              isDead: false,
              isMove: true,
              isOwnCol: user.guns[i].isOwnCol
            };
            user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
            user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
            user.guns[i].shotTime = (0.6 - 0.04 * bulletOwner.stats[6]) / user.guns[i].coolTime * 1000;
          }
        break;
        case "drone":
          if (user.guns[i].shotTime <= 0  && user.guns[i].shotPTime < user.guns[i].clickTime/((0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000) && user.guns[i].bulletLimit>0){
            user.guns[i].bulletLimit--;
            let rotate = user.rotate+user.guns[i].rotate+util.randomRange(-user.guns[i].rotateDistance,user.guns[i].rotateDistance);
            let bulletOwner = (user.guns[i].owner)?user.guns[i].owner:user;
            object = {
              objType: 'drone',
              type: user.guns[i].bulletType,
              owner: bulletOwner,
              id: objID(),
              team: bulletOwner.team,
              x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * util.isF(user.radius) + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * util.isF(user.radius),
              y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * util.isF(user.radius) + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * util.isF(user.radius),
              rotate: rotate,
              dx: Math.cos(rotate) * (3.2 + 0.2 * bulletOwner.stats[3]) * user.guns[i].speed,
              dy: Math.sin(rotate) * (3.2 + 0.2 * bulletOwner.stats[3]) * user.guns[i].speed,
              speed: (0.056 + 0.01 * bulletOwner.stats[3]) * user.guns[i].speed,
              health: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              maxHealth: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              lastHealth: (8 + 6 * bulletOwner.stats[4]) * user.guns[i].health,
              damage: (7 + 3 * bulletOwner.stats[5]) * user.guns[i].damage,
              radius: 0.4 * user.guns[i].radius * util.isF(bulletOwner.radius),
              bound: user.guns[i].bulletBound,
              invTime: -1,
              opacity: 1,
              moveAi: user.guns[i].bulletAi,
              event:{
                deadEvent:function(killer){
                  user.guns[i].bulletLimit++;
                }
              },
              goTank: false,
              goEnemy: null,
              spawnTime: Date.now(),
              hitTime: Date.now(),
              hitObject: null,
              isBorder : true,
              isCollision: false,
              isDead: false,
              isMove: true,
              isOwnCol: true
            };
            user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
            user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
            user.guns[i].shotTime = (0.6 - 0.04 * bulletOwner.stats[6]) / user.guns[i].coolTime * 1000;
          }
        break;
        case "auto":
        break;
        default:
        break;
      }
      if (object){
        if (object.type === 2 || object.type === 3){
          user.guns[i].bullets.push(object);
        }
        objects.push(object);
      }
    }
    else{
      user.guns[i].clickTime = 0;
    }
    if (user.guns[i].shotTime > 0) user.guns[i].shotTime -= 1000/60;
  }
}

exports.bulletSet = function(user,p){ // 유저의 총알 발사
  let bullets = [];
  let isShot = false;

  for (let i=0;i<user.guns.length;i++){
    if (p && p.mouse.left || user.guns[i].autoShot){
      if (p && p.mouse.left) isShot = true;
      user.guns[i].clickTime += 1000/60;
      if (user.guns[i].shotTime <= 0 && user.guns[i].shotPTime < user.guns[i].clickTime/((0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000)){
        let rotate = user.guns[i].dir.rotate===null?user.rotate+user.guns[i].rotate:user.guns[i].dir.rotate;
        rotate += util.randomRange(-user.guns[i].rotateDistance,user.guns[i].rotateDistance);
        if (user.guns[i].life === -1){
          if (user.guns[i].bulletCount === user.guns[i].bulletLimit) continue;
          user.guns[i].bulletCount++;
        }
        bullets.push({
            type: user.guns[i].bulletType,
            objType: 'bullet',
            id: bulletId++,
            owner: user.id,
            ownerTank: user,
            ownerType: user.type,
            gunId: i,
            guns: user.guns[i].guns,
            x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            w: 10,
            h: 10,
            rotate: rotate,
            dx: Math.cos(rotate) * (3.2 + 0.2 * user.stats[3]) * user.guns[i].speed,
            dy: Math.sin(rotate) * (3.2 + 0.2 * user.stats[3]) * user.guns[i].speed,
            speed: (0.056 + 0.01 * user.stats[3]) * user.guns[i].speed,
            health: (8 + 6 * user.stats[4]) * user.guns[i].health,
            maxHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            lastHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            damage: (7 + 3 * user.stats[5]) * user.guns[i].damage,
            radius: 0.4 * user.guns[i].radius * user.radius,
            bound: user.guns[i].bulletBound,
            time: 1000 * user.guns[i].life,
            isCollision: false,
            isOwnCol: user.guns[i].isOwnCol,
            moveAi: user.guns[i].bulletAi,
            goTank: false,
            goEnemy: undefined,
            hitTime: Date.now(),
            hitObject: null,
            isDead: false
        });
        user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000;
      }
    }
    else{
      user.guns[i].clickTime = 0;
    }
    if (user.guns[i].shotTime > 0) user.guns[i].shotTime -= 1000/60;
  }
  return [bullets,isShot];
}

exports.bulletbulletSet = function(user,p){ // 유저의 총알 발사
  let bullets = [];

  for (let i=0;i<user.guns.length;i++){
    if ((p && (p.mouse.left || p.mouse.right)) || user.goEnemy !== undefined || user.guns[i].autoShot){
      user.guns[i].clickTime += 1000/60;
      if (user.guns[i].shotTime <= 0 && user.guns[i].shotPTime < user.guns[i].clickTime/((0.6 - 0.04 * user.ownerTank.stats[6]) / user.guns[i].coolTime * 1000)){
        let rotate = user.guns[i].dir.rotate===null?user.rotate+user.guns[i].rotate:user.guns[i].dir.rotate;
        rotate += util.randomRange(-user.guns[i].rotateDistance,user.guns[i].rotateDistance);
        if (user.guns[i].life === -1){
          if (user.guns[i].bulletCount === user.guns[i].bulletLimit) continue;
          user.guns[i].bulletCount++;
        }
        bullets.push({
            type: user.guns[i].bulletType,
            objType: 'bullet',
            id: bulletId++,
            owner: user.ownerTank.id,
            ownerTank: user.ownerTank,
            ownerType: user.ownerTank.type,
            gunId: i,
            x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            w: 10,
            h: 10,
            rotate: rotate,
            dx: Math.cos(rotate) * (3.2 + 0.2 * user.ownerTank.stats[3]) * user.guns[i].speed,
            dy: Math.sin(rotate) * (3.2 + 0.2 * user.ownerTank.stats[3]) * user.guns[i].speed,
            speed: (0.056 + 0.01 * user.ownerTank.stats[3]) * user.guns[i].speed,
            health: (8 + 6 * user.ownerTank.stats[4]) * user.guns[i].health,
            maxHealth: (8 + 6 * user.ownerTank.stats[4]) * user.guns[i].health,
            lastHealth: (8 + 6 * user.ownerTank.stats[4]) * user.guns[i].health,
            damage: (7 + 3 * user.ownerTank.stats[5]) * user.guns[i].damage,
            radius: 0.4 * user.guns[i].radius * user.radius,
            bound: user.guns[i].bulletBound,
            time: 1000 * user.guns[i].life,
            isCollision: false,
            isOwnCol: user.guns[i].isOwnCol,
            moveAi: user.guns[i].bulletAi,
            goTank: false,
            goEnemy: undefined,
            hitTime: Date.now(),
            hitObject: null,
            isDead: false
        });
        user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.guns[i].shotTime = (0.6 - 0.04 * user.ownerTank.stats[6]) / user.guns[i].coolTime * 1000;
      }
    }
    else{
      user.guns[i].clickTime = 0;
    }
    if (user.guns[i].shotTime > 0) user.guns[i].shotTime -= 1000/60;
  }
  return bullets;
}

exports.moveBullet = function(b,mapSize,p,target){ // 총알의 움직임
  b.moveAi(b,mapSize,p,target);
  utilObj.moveObject(b);
}
