'use strict';

const util = require('./librarys');
const utilObj = require('./objectSet');

exports.moveUser = function(u,mapSize){ // 유저(탱크)의 움직임
  if (u.moveRotate!=null && !isNaN(u.moveRotate)){
    u.dx+=Math.cos(u.moveRotate) * 0.07;
    u.dy+=Math.sin(u.moveRotate) * 0.07;
  }
  utilObj.moveObject(u);
  if (u.x>mapSize.x+51.6) u.x=mapSize.x+51.6;
  if (u.x<-mapSize.x-51.6) u.x=-mapSize.x-51.6;
  if (u.y>mapSize.y+51.6) u.y=mapSize.y+51.6;
  if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
  if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
  if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
}

exports.isDeadPlayer = function(obj,users){ // 죽었는가?
  obj.isCollision = false;
  if (obj.health <= 0){
    if (util.findIndex(users,obj.id) > -1){
      users.splice(util.findIndex(users,obj.id),1);
      return true;
    }
  }
  return false;
}

/*
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
      dir:{rotate:pi,rotateDistance:pi,distance:%}
    }
*/

exports.setUserGun = function(user){ // 유저 총구 설정.
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
