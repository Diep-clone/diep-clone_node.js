'use strict';

const util = require('./librarys');
const utilObj = require('./objectSet');

let maxShapes = 0;
let shapeCount = 0.5;
let shapeId = 0;

exports.spawnShape = function (mapSize){
  let list = [];
  while (maxShapes>shapeCount){
    list.push({
      id:shapeId++,
      objType:'shape',
      x:util.randomRange(-mapSize.x,mapSize.x),
      y:util.randomRange(-mapSize.y,mapSize.y),
      w:10,
      h:10,
      dx:0,
      dy:0,
      radius:13,
      rotate:util.randomRange(-Math.PI,Math.PI),
      type:0,
      exp:10,
      health:10,
      maxHealth:10,
      lastHealth:10,
      damage:8,
      bound:1,
      isCollision:false,
      isDead:false
    });
    shapeCount++;
  }
  return list;
}

exports.isDeadShape = function (obj,shapes){
  obj.isCollision = false;
  if (obj.health <= 0){
    if (util.findIndex(shapes,obj.id) > -1){
      obj.isDead=true;
      shapeCount--;
      shapes.splice(util.findIndex(shapes,obj.id),1);
      return true;
    }
  }
  return false;
}

exports.extendMaxShape = function (n){
  maxShapes+=n;
}

exports.moveShape = function (s,mapSize,target){
  switch(s.type){
    case 1:
    break;
    case 2:
    break;
    case 3:
    break;
    case 4:
    break;
    case 5:
    break;
    default:
    break;
  }
  if (s.x>mapSize.x+51.6) s.x=mapSize.x+51.6;
  if (s.x<-mapSize.x-51.6) s.x=-mapSize.x-51.6;
  if (s.y>mapSize.y+51.6) s.y=mapSize.y+51.6;
  if (s.y<-mapSize.y-51.6) s.y=-mapSize.y-51.6;
  utilObj.moveObject(s);
}
