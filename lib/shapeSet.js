'use strict';

const util = require('./librarys');
let maxShapes = 10;
let shapeCount = 0;
let shapeId = 0;

exports.spawnShape = function (list,mapSize){
  while (maxShapes>shapeCount++){
    list.push({
      id:shapeId++,
      x:util.randomRange(-mapSize/2,mapSize/2),
      y:util.randomRange(-mapSize/2,mapSize/2),
      dx:0,
      dy:0,
      radius:20,
      rotate:util.randomRange(-Math.PI,Math.PI),
      exp:10,
      health:10,
      maxHealth:10,
      lastHealth:10,
      damage:8,
      bound:1,
      isCollision:false
    });
  }
}

exports.moveShape = function (s,target){
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
}
