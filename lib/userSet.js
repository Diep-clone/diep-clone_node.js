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
      rotate:pi,
      radius:%,
      bound:%,
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
        rotate:0,
        radius:1,
        bound:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      case 1:
      user.guns = [{
        bulletType:1,
        speed:1,
        damage:0.65,
        health:1,
        rotate:0,
        radius:1,
        bound:0.75,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0.5,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
        bulletType:1,
        speed:1,
        damage:0.65,
        health:1,
        rotate:0,
        radius:1,
        bound:0.75,
        coolTime:1,
        shotTime:0,
        shotPTime:0.5,
        autoShot:false,
        life:3,
        pos:{x:-0.5,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }
      ];
      break;
      case 2:
      user.guns = [{
        bulletType:1,
        speed:1,
        damage:0.6,
        health:0.7,
        rotate:0,
        radius:1,
        bound:0.5,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
        bulletType:1,
        speed:1,
        damage:0.6,
        health:0.7,
        rotate:0,
        radius:1,
        bound:0.5,
        coolTime:1,
        shotTime:0,
        shotPTime:0.5,
        autoShot:false,
        life:3,
        pos:{x:0.5,y:1.6},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
        bulletType:1,
        speed:1,
        damage:0.6,
        health:0.7,
        rotate:0,
        radius:1,
        bound:0.5,
        coolTime:1,
        shotTime:0,
        shotPTime:0.5,
        autoShot:false,
        life:3,
        pos:{x:-0.5,y:1.6},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      case 3:
      user.guns = [{
        bulletType:1,
        speed:1,
        damage:0.7,
        health:1,
        rotate:0,
        radius:1,
        bound:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
        bulletType:1,
        speed:1,
        damage:0.7,
        health:1,
        rotate:Math.PI / 4,
        radius:1,
        bound:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
        bulletType:1,
        speed:1,
        damage:0.7,
        health:1,
        rotate:-Math.PI / 4,
        radius:1,
        bound:1,
        coolTime:1,
        shotTime:0,
        shotPTime:0,
        autoShot:false,
        life:3,
        pos:{x:0,y:1.88},
        dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      case 4:
      user.guns = [];
      for (let i=-Math.PI/2;i<=Math.PI;i+=Math.PI/2){
        user.guns.push({
          bulletType:1,
          speed:1,
          damage:0.75,
          health:1,
          rotate:i,
          radius:1,
          bound:1,
          coolTime:1,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.88},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
        });
      }
      break;
      case 5:
      user.guns = [];
      for (let i=-Math.PI/2;i<=Math.PI;i+=Math.PI/2){
        user.guns.push({
          bulletType:1,
          speed:1,
          damage:0.65,
          health:1,
          rotate:i,
          radius:1,
          bound:1,
          coolTime:1,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.88},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
        });
      }
      for (let i=-Math.PI/4*3;i<=Math.PI;i+=Math.PI/2){
        user.guns.push({
          bulletType:1,
          speed:1,
          damage:0.65,
          health:1,
          rotate:i,
          radius:1,
          bound:1,
          coolTime:1,
          shotTime:0,
          shotPTime:0.5,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.88},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
        });
      }
      break;
      case 6:
      user.guns = [{
          bulletType:1,
          speed:1.5,
          damage:1,
          health:1,
          rotate:0,
          radius:1,
          bound:3,
          coolTime:0.667,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:2.2},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }];
      break;
      case 7:
      user.guns = [{
          bulletType:1,
          speed:1,
          damage:0.7,
          health:1,
          rotate:0,
          radius:1,
          bound:1,
          coolTime:2,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.6},
          dir:{rotate:null,rotateDistance:Math.PI/16,distance:0}
      }];
      break;
      case 8:
      user.guns = [{
          bulletType:1,
          speed:1,
          damage:1,
          health:1,
          rotate:0,
          radius:1,
          bound:1,
          coolTime:1,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.88},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
          bulletType:1,
          speed:1,
          damage:1,
          health:1,
          rotate:Math.PI,
          radius:1,
          bound:1,
          coolTime:1,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.6},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      case 9:
      user.guns = [{
          bulletType:1,
          speed:1,
          damage:1,
          health:1,
          rotate:0,
          radius:1,
          bound:0.2,
          coolTime:1,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.88},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
          bulletType:1,
          speed:1,
          damage:0.2,
          health:1,
          rotate:Math.PI / 6 * 5,
          radius:1,
          bound:2.5,
          coolTime:1,
          shotTime:0,
          shotPTime:0.5,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.6},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      },{
          bulletType:1,
          speed:1,
          damage:0.2,
          health:1,
          rotate:-Math.PI / 6 * 5,
          radius:1,
          bound:2.5,
          coolTime:1,
          shotTime:0,
          shotPTime:0.5,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.6},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      case 10:
      user.guns = [{
          bulletType:1,
          speed:0.75,
          damage:3,
          health:2,
          rotate:0,
          radius:1.75,
          bound:15,
          coolTime:0.25,
          shotTime:0,
          shotPTime:0,
          autoShot:false,
          life:3,
          pos:{x:0,y:1.8},
          dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
      }];
      break;
      default:
      user.guns = [];
      break;
  }
}
