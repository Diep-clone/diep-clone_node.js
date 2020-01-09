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

exports.setUserSight = function(user){
  switch(user.type){
    case 6: // Sniper
    case 11: // Overseer
    case 12: // Overload
    case 17: // Necromanser
    case 26: // Manager
    case 30: // Trapper
    case 31: // GunnerTrapper
    case 32: // OverTrapper
    case 33: // MegaTrapper
    case 34: // TriTrapper
    case 35: // Smasher
    case 36: // Landmine
    case 42: // AutoTrapper
    case 46: // BattleShip
    case 48: // AutoSmasher
    case 49: // Spike
    case 50: // Factory
    case 51: // Skimmer
    case 52: // Rocketeer
    return 1.11;
    break;
    case 19: // Hunter
    case 28: // Predator
    case 41: // Streamliner
    return 1.176;
    break;
    case 15: // Assasin
    case 21: // Stakler
    return 1.25;
    break;
    case 22: // Ranger
    return 1.428;
    break;
    default:
    return 1;
    break;
  }
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

function getGun(data){
  let gun = {
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
  }
  for (let key in data){
    gun[key]=data[key];
  }
  return gun;
}

exports.setUserGun = function(user){ // 유저 총구 설정.
  switch(user.type){
      case 0: // Basic
      user.guns = [getGun()];
      break;
      case 1: // Twin
      user.guns = [getGun({
        damage:0.65,
        bound:0.75,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.65,
        bound:0.75,
        pos:{x:-0.5,y:1.88}
      })];
      break;
      case 2: // Triplet
      user.guns = [getGun({
        damage:0.6,
        health:0.7,
        bound:0.5
      }),getGun({
        damage:0.6,
        health:0.7,
        bound:0.5,
        shotPTime:0.5,
        pos:{x:0.5,y:1.6}
      }),getGun({
        damage:0.6,
        health:0.7,
        bound:0.5,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.6}
      })];
      break;
      case 3: // TripleShot
      user.guns = [getGun({
        damage:0.7
      }),getGun({
        damage:0.7,
        rotate:Math.PI / 4
      }),getGun({
        damage:0.7,
        rotate:-Math.PI / 4
      })];
      break;
      case 4: // QuadTank
      user.guns = [];
      for (let i=-Math.PI/2;i<=Math.PI;i+=Math.PI/2){
        user.guns.push(getGun({
          damage:0.75,
          rotate:i
        }));
      }
      break;
      case 5: // OctoTank
      user.guns = [];
      for (let i=-Math.PI/2;i<=Math.PI;i+=Math.PI/2){
        user.guns.push(getGun({
          damage:0.65,
          rotate:i
        }));
      }
      for (let i=-Math.PI/4*3;i<=Math.PI;i+=Math.PI/2){
        user.guns.push(getGun({
          damage:0.65,
          rotate:i,
          shotPTime:0.5
        }));
      }
      break;
      case 6: // Sniper
      user.guns = [getGun({
          speed:1.5,
          bound:3,
          coolTime:0.667,
          pos:{x:0,y:2.2},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 7: // MachineGun
      user.guns = [getGun({
          damage:0.7,
          coolTime:2,
          pos:{x:0,y:1.6},
          dir:{rotate:null,rotateDistance:Math.PI/16,distance:0}
      })];
      break;
      case 8: // FlankGuard
      user.guns = [getGun(),getGun({
          rotate:Math.PI,
          pos:{x:0,y:1.6},
      })];
      break;
      case 9: // TriAngle
      user.guns = [getGun({
          bound:0.2
      }),getGun({
          damage:0.2,
          rotate:Math.PI / 6 * 5,
          bound:2.5,
          shotPTime:0.5,
          life:1.5,
          pos:{x:0,y:1.6}
      }),getGun({
          damage:0.2,
          rotate:-Math.PI / 6 * 5,
          bound:2.5,
          shotPTime:0.5,
          life:1.5,
          pos:{x:0,y:1.6}
      })];
      break;
      case 10: // Destroyer
      user.guns = [getGun({
          speed:0.75,
          damage:3,
          health:2,
          radius:1.75,
          bound:15,
          coolTime:0.25,
          pos:{x:0,y:1.8}
      })];
      break;
      case 11: // Overseer
      break;
      case 12: // Overload
      break;
      case 13: // TwinFlank
      break;
      case 14: // PentaShot
      break;
      case 15: // Assasin
      break;
      case 16: // ArenaCloser
      break;
      case 17: // Necromanser
      break;
      case 18: // TripleTwin
      break;
      case 19: // Hunter
      break;
      case 20: // Gunner
      break;
      case 21: // Stalker
      break;
      case 22: // Ranger
      break;
      case 23: // Booster
      break;
      case 24: // Fighter
      break;
      case 25: // Hybrid
      break;
      case 26: // Manager
      break;
      case 27: // MotherShip
      break;
      case 28: // Predator
      break;
      case 29: // Sprayer
      break;
      case 30: // Trapper
      break;
      case 31: // GunnerTrapper
      break;
      case 32: // OverTrapper
      break;
      case 33: // MegaTrapper
      break;
      case 34: // TriTrapper
      break;
      case 35: // Smasher
      break;
      case 36: // Landmine
      break;
      case 37: // AutoGunner
      break;
      case 38: // Auto5
      break;
      case 39: // Auto3
      break;
      case 40: // SpreadShot
      break;
      case 41: // Streamliner
      break;
      case 42: // AutoTrapper
      break;
      case 43: // BasicDominator
      break;
      case 44: // GunnerDominator
      break;
      case 45: // TrapperDominator
      break;
      case 46: // BattleShip
      break;
      case 47: // Annihilator
      break;
      case 48: // AutoSmasher
      break;
      case 49: // Spike
      break;
      case 50: // Factory
      break;
      case 51: // Skimmer
      break;
      case 52: // Rocketeer
      break;
      default:
      user.guns = [];
      break;
  }
}
