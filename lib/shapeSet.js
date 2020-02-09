'use strict';

const util = require('./utility');
const utilObj = require('./objectSet');

let maxShapes = 30;
let shapeCount = 0;

exports.spawnShape = function (objects,mapSize,objID){
  while (maxShapes>shapeCount){
    objects.push({
      objType:'shape',
      type:0,
      owner: null,
      id:objID(),
      team: 'ene',
      x:util.randomRange(-mapSize.x,mapSize.x),
      y:util.randomRange(-mapSize.y,mapSize.y),
      dx:0,
      dy:0,
      exp:10,
      health:10,
      maxHealth:10,
      lastHealth:10,
      damage:8,
      radius:10,
      rotate:util.randomRange(-Math.PI,Math.PI),
      bound:0.2,
      opacity: 1,
      name: "square",
      spawnTime: Date.now(),
      hitTime: Date.now(),
      deadTime: -1,
      hitObject: null,
      moveAi:null,
      isBorder : true,
      isCollision:false,
      isMove: true,
      isDead:false
    });
    shapeCount++;
  }
}

exports.isDeadShape = function (obj,shapes){
  obj.isCollision = false;
  if ((obj.ownerTank && (obj.ownerTank.isDead || obj.ownerTank.type !== obj.ownerType))
  || obj.health <= 0){
    if (util.findIndex(shapes,obj.id) > -1){
      if (obj.type===0 && !obj.owner
        && ((obj.hitObject.objType === 'tank' && obj.hitObject.type === 17) || (obj.hitObject.objType === 'shape' && obj.hitObject.ownerTank.type === 17))){
        let ownerTank = obj.hitObject;
        if (obj.hitObject.objType === 'shape' && obj.hitObject.ownerTank.type === 17) ownerTank = obj.hitObject.ownerTank;
        if (ownerTank.droneCount >= 22 + 2 * ownerTank.stats[6]){
          obj.isDead=true;
          shapeCount--;
          shapes.splice(util.findIndex(shapes,obj.id),1);
          return true;
        }
        ownerTank.droneCount++;
        obj.exp = 0;
        obj.owner = ownerTank.id;
        obj.ownerTank = ownerTank;
        obj.ownerType = ownerTank.type,
        obj.hitObject = null;
        obj.health = obj.maxHealth = (8 + 6 * ownerTank.stats[4]) * 0.5;
        obj.damage = (7 + 3 * ownerTank.stats[5]) * 1.68;
        obj.speed = (0.056 + 0.01 * ownerTank.stats[3]) * 0.5;
        obj.moveAi = function(b,mapSize,p,target){
          if (p && p.mouse.right){
            b.rotate = Math.atan2(b.y-p.target.y,b.x-p.target.x);
            b.dx += Math.cos(b.rotate) * b.speed;
            b.dy += Math.sin(b.rotate) * b.speed;
            b.goTank = false;
          }
          else if (p && p.mouse.left){
            b.rotate = Math.atan2(p.target.y-b.y,p.target.x-b.x);
            b.dx += Math.cos(b.rotate) * b.speed;
            b.dy += Math.sin(b.rotate) * b.speed;
            b.goTank = false;
          }
          else if (b.ownerTank){
            let dis = Math.sqrt((b.ownerTank.x-b.x)*(b.ownerTank.x-b.x)+(b.ownerTank.y-b.y)*(b.ownerTank.y-b.y));

            if (b.goTank){
              if (dis<70) b.goTank = false;
              else{
                b.rotate = Math.atan2(b.ownerTank.y-b.y,b.ownerTank.x-b.x);
                b.dx += Math.cos(b.rotate) * b.speed;
                b.dy += Math.sin(b.rotate) * b.speed;
              }
            }
            else if (b.goEnemy !== undefined){
              if (b.goEnemy.isDead || b.goEnemy.owner === b.owner){
                b.goEnemy = target;
              }
              else if (dis>417.96){
                b.goEnemy = undefined;
              }
              else{
                b.rotate = Math.atan2(b.goEnemy.y-b.y,b.goEnemy.x-b.x);
                b.dx += Math.cos(b.rotate) * b.speed;
                b.dy += Math.sin(b.rotate) * b.speed;
              }
            }
            else if (dis<util.randomRange(80,100)){ // 플레이어 주변에 있으면
              let dir = Math.atan2(b.ownerTank.y-b.y,b.ownerTank.x-b.x) - Math.PI / 2;
              b.dx += Math.cos(dir) * 0.01;
              b.dy += Math.sin(dir) * 0.01;
              b.rotate=Math.atan2(b.dy,b.dx);
              if (target !== undefined) b.goEnemy = target;
            }
            else{
              b.goTank = true;
            }
          }

          if (b.x>mapSize.x+51.6) b.x=mapSize.x+51.6;
          if (b.x<-mapSize.x-51.6) b.x=-mapSize.x-51.6;
          if (b.y>mapSize.y+51.6) b.y=mapSize.y+51.6;
          if (b.y<-mapSize.y-51.6) b.y=-mapSize.y-51.6;
        };
        return false;
      }
      else{
        if (obj.ownerTank) obj.ownerTank.droneCount--;
        obj.isDead=true;
        shapeCount--;
        obj.hitObject.exp += obj.exp;
        shapes.splice(util.findIndex(shapes,obj.id),1);
        return true;
      }
    }
  }
  return false;
}

exports.extendMaxShape = function (n){
  maxShapes+=n;
}

exports.moveShape = function (s,mapSize,p,target){
  s.moveAi(s,mapSize,p,target);
  utilObj.moveObject(s);
}
