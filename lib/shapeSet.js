'use strict';

const util = require('./utility');
const utilObj = require('./objectSet');

let maxShapes = 10;
let shapeCount = 0;

exports.spawnShape = function (objects,mapSize,objID){
  while (maxShapes>shapeCount){
    let xx = util.randomRange(-mapSize.x,mapSize.x);
    let yy = util.randomRange(-mapSize.y,mapSize.y);
    let type = Math.floor(util.randomRange(0,6));
    let name = [
      "square",
      "triangle",
      "pentagon",
      "alphaPentagon",
      "triangle",
      "triangle"
    ];
    let exp = [10,25,130,3000,15,25];
    let health = [10,30,100,3000,10,30];
    let damage = [8,8,12,20,8,8];
    let radius = [10,10,12,30,5,8];
    let bound = [0.2,0.2,0.1,0.002,0,0];

    objects.push({
      objType:'shape',
      type:type,
      owner: null,
      id:objID(),
      team: 'ene',
      x:xx,
      y:yy,
      dx:0,
      dy:0,
      exp:exp[type],
      health:health[type],
      maxHealth:health[type],
      lastHealth:health[type],
      damage:damage[type],
      radius:radius[type],
      rotate:util.randomRange(-Math.PI,Math.PI),
      bound:bound[type],
      opacity: 1,
      name: name[type],
      isOwnCol: true,
      spawnTime: Date.now(),
      hitTime: Date.now(),
      deadTime: -1,
      event:{
        killEvent:function(deader){
          return true;
        },
        deadEvent:function(killer){
          shapeCount--;
          return true;
        }
      },
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

exports.extendMaxShape = function (n){
  maxShapes+=n;
}

exports.moveShape = function (s,mapSize,p,target){
  s.moveAi(s,mapSize,p,target);
  utilObj.moveObject(s);
}
