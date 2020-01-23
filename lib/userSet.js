'use strict';

const util = require('./librarys');
const utilObj = require('./objectSet');

exports.moveUser = function(u,mapSize,p){ // 유저(탱크)의 움직임
  if (p && p.rotate!=null){
    //* 0.07;
    //u.dx+=Math.cos(p.rotate) * (Math.pow(0.985,u.level)*0.13+u.stats[7]*0.0035)*0.8;
    //u.dy+=Math.sin(p.rotate) * (Math.pow(0.985,u.level)*0.13+u.stats[7]*0.0035)*0.8;
    u.dx+=Math.cos(p.rotate) * 0.07 * Math.pow(0.985,u.level-1);
    u.dy+=Math.sin(p.rotate) * 0.07 * Math.pow(0.985,u.level-1);
  }
  utilObj.moveObject(u);
  if (u.x>mapSize.x+51.6) u.x=mapSize.x+51.6;
  if (u.x<-mapSize.x-51.6) u.x=-mapSize.x-51.6;
  if (u.y>mapSize.y+51.6) u.y=mapSize.y+51.6;
  if (u.y<-mapSize.y-51.6) u.y=-mapSize.y-51.6;
}

exports.isDeadPlayer = function(obj,users){ // 죽었는가?
  obj.isCollision = false;
  if (obj.health <= 0){
    if (util.findIndex(users,obj.id) > -1){
      obj.isDead=true;
      users.splice(util.findIndex(users,obj.id),1);
      return true;
    }
  }
  return false;
}

exports.afkTank = function(t){
  t.health-=t.maxHealth/1000*60/10;
}

exports.setUserSight = function(user){
  //let sight = 1.786 - user.level * 0.008;
  let sight = 16/9*Math.pow(0.995,user.level-1);
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
    return sight / 1.11;
    break;
    case 19: // Hunter
    case 28: // Predator
    case 41: // Streamliner
    return sight / 1.176;
    break;
    case 15: // Assasin
    case 21: // Stakler
    return sight / 1.25;
    break;
    case 22: // Ranger
    return sight / 1.428;
    break;
    default:
    return sight;
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
    bulletBound:1,
    coolTime:1,
    shotTime:0,
    shotPTime:0,
    autoShot:false,
    life:3,
    bulletCount: 0,
    bulletLimit: 0,
    isownCol:false,
    isBorder:false,
    isAi: false,
    pos:{x:0,y:1.88},
    dir:{rotate:null,rotateDistance:Math.PI/72,distance:0}
  }
  for (let key in data){
    gun[key]=data[key];
  }
  return gun;
}

exports.setUserTank = function(user){ // 유저 총구 설정.
  user.maxStats = [8,8,8,8,8,8,8,8];
  user.invTime=-1;
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
        shotPTime:0.5,
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
          bulletBound:0.1,
          coolTime:0.25,
          pos:{x:0,y:1.88}
      })];
      break;
      case 11: // Overseer
        user.guns = [getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:Math.PI/2,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:4,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        }),getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:-Math.PI/2,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:4,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        })];
      break;
      case 12: // Overload
        user.guns = [getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:Math.PI/2,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:2,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        }),getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:-Math.PI/2,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:2,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        }),getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:0,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:2,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        }),getGun({
          bulletType:2,
          speed:0.6,
          damage:0.7,
          health:2,
          rotate:Math.PI,
          bulletBound:0.4,
          coolTime:0.167,
          autoShot:true,
          bulletLimit:2,
          isownCol:true,
          isBorder:true,
          life:-1,
          pos:{x:0,y:1.6}
        })];
      break;
      case 13: // TwinFlank
      user.guns = [getGun({
        damage:0.5,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.5,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:Math.PI,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:Math.PI,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.88}
      })];
      break;
      case 14: // PentaShot
      user.guns = [getGun({
        damage:0.6,
        bound:0.7,
        pos:{x:0,y:2.25}
      }),getGun({
        damage:0.6,
        bound:0.7,
        shotPTime:0.333,
        rotate:Math.PI / 8,
        pos:{x:0,y:1.9}
      }),getGun({
        damage:0.6,
        bound:0.7,
        shotPTime:0.333,
        rotate:-Math.PI / 8,
        pos:{x:0,y:1.9}
      }),getGun({
        damage:0.6,
        bound:0.7,
        shotPTime:0.667,
        rotate:Math.PI / 4,
        pos:{x:0,y:1.6}
      }),getGun({
        damage:0.6,
        bound:0.7,
        shotPTime:0.667,
        rotate:-Math.PI / 4,
        pos:{x:0,y:1.6}
      })];
      break;
      case 15: // Assasin
      user.guns = [getGun({
          speed:1.5,
          bound:3,
          coolTime:0.5,
          pos:{x:0,y:2.45},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 16: // ArenaCloser
      break;
      case 17: // Necromanser
      break;
      case 18: // TripleTwin
      user.guns = [getGun({
        damage:0.5,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.5,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:Math.PI / 3 * 2,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:Math.PI / 3 * 2,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:-Math.PI / 3 * 2,
        pos:{x:0.5,y:1.88}
      }),getGun({
        damage:0.5,
        rotate:-Math.PI / 3 * 2,
        shotPTime:0.5,
        pos:{x:-0.5,y:1.88}
      })];
      break;
      case 19: // Hunter
      user.guns = [getGun({
          speed:1.25,
          damage:0.75,
          radius:0.7,
          bound:0.03,
          coolTime:0.4,
          pos:{x:0,y:2.23},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:1.25,
          damage:0.75,
          bound:0.03,
          shotPTime:0.25,
          coolTime:0.4,
          pos:{x:0,y:2.23},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 20: // Gunner
      user.guns = [getGun({
        damage:0.5,
        health:0.45,
        radius:0.6,
        bound:0.2,
        shotPTime:0,
        pos:{x:0.35,y:1.75}
      }),getGun({
        damage:0.5,
        health:0.45,
        radius:0.6,
        bound:0.2,
        shotPTime:0.25,
        pos:{x:-0.35,y:1.75}
      }),getGun({
        damage:0.5,
        health:0.45,
        radius:0.6,
        bound:0.2,
        shotPTime:0.5,
        pos:{x:0.67,y:1.3}
      }),getGun({
        damage:0.5,
        health:0.45,
        radius:0.6,
        bound:0.2,
        shotPTime:0.75,
        pos:{x:-0.67,y:1.3}
      })];
      break;
      case 21: // Stalker
      user.guns = [getGun({
          speed:1.5,
          bound:3,
          coolTime:0.5,
          pos:{x:0,y:2.45},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      user.invTime=1.5;
      break;
      case 22: // Ranger
      user.guns = [getGun({
          speed:1.5,
          bound:3,
          coolTime:0.5,
          pos:{x:0,y:2.47},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 23: // Booster
      user.guns = [getGun({
        bound:0.2
      }),getGun({
        damage:0.2,
        rotate:Math.PI / 6 * 5,
        bound:2.5,
        shotPTime:0.5,
        life:1.5,
        pos:{x:0,y:1.65}
      }),getGun({
        damage:0.2,
        rotate:-Math.PI / 6 * 5,
        bound:2.5,
        shotPTime:0.5,
        life:1.5,
        pos:{x:0,y:1.65}
      }),getGun({
        damage:0.2,
        bound:0.85,
        life:1.5,
        shotPTime:0.75,
        rotate:Math.PI / 4 * 3,
        pos:{x:0,y:1.45}
      }),getGun({
        damage:0.2,
        bound:0.85,
        life:1.5,
        shotPTime:0.75,
        rotate:-Math.PI / 4 * 3,
        pos:{x:0,y:1.45}
      })];
      break;
      case 24: // Fighter
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
      }),getGun({
        damage:0.8,
        rotate:Math.PI / 2,
        coolTime:0.667
      }),getGun({
        damage:0.8,
        rotate:-Math.PI / 2,
        coolTime:0.667
      })];
      break;
      case 25: // Hybrid
      user.guns = [getGun({
        speed:0.75,
        damage:3,
        health:2,
        radius:1.75,
        bound:15,
        bulletBound:0.1,
        coolTime:0.25,
        pos:{x:0,y:1.88}
      }),getGun({
        bulletType:2,
        speed:0.6,
        damage:0.7,
        health:1.4,
        rotate:Math.PI,
        bulletBound:0.4,
        coolTime:0.167,
        autoShot:true,
        bulletLimit:2,
        isownCol:true,
        isBorder:true,
        life:-1,
        pos:{x:0,y:1.6}
      })];
      break;
      case 26: // Manager
      user.guns = [getGun({
        bulletType:2,
        speed:0.6,
        damage:0.7,
        health:2,
        bulletBound:0.4,
        coolTime:0.333,
        autoShot:true,
        bulletLimit:1,
        isownCol:true,
        isBorder:true,
        life:-1,
        pos:{x:0,y:1.6}
      })];
      user.invTime=1.5;
      break;
      case 27: // MotherShip
      break;
      case 28: // Predator
      user.guns = [getGun({
          speed:1.25,
          damage:0.75,
          radius:0.7,
          bound:0.03,
          coolTime:0.4,
          pos:{x:0,y:2.23},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:1.25,
          damage:0.75,
          radius:0.95,
          bound:0.03,
          shotPTime:0.25,
          coolTime:0.4,
          pos:{x:0,y:2.23},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:1.25,
          damage:0.75,
          radius:1.25,
          bound:0.03,
          shotPTime:0.5,
          coolTime:0.4,
          pos:{x:0,y:2.23},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 29: // Sprayer
      user.guns = [getGun({
        damage:0.7,
        coolTime:2,
        pos:{x:0,y:1.6},
        dir:{rotate:null,rotateDistance:Math.PI/16,distance:0}
      }),getGun({
        damage:0.1,
        radius:0.7,
        bound:0.05,
        shotPTime:0.5,
        pos:{x:0,y:2.25}
      })];
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
      user.maxStats = [10,10,10,0,0,0,0,10];
      user.guns = [];
      break;
      case 36: // Landmine
      user.maxStats = [10,10,10,0,0,0,0,10];
      user.guns = [];
      user.invTime=13.5;
      break;
      case 37: // AutoGunner
      break;
      case 38: // Auto5
      break;
      case 39: // Auto3
      break;
      case 40: // SpreadShot
      user.guns = [getGun({
        coolTime:0.5,
        bound:0.095
      })];
      for (let i=1;i<=5;i++){
        user.guns.push(getGun({
          damage:0.6,
          coolTime:0.5,
          rotate:Math.PI/12*i,
          radius:0.7,
          bound:0.095,
          shotPTime:0.167*i,
          pos:{x:0,y:1.92-i*0.12}
        }));
        user.guns.push(getGun({
          damage:0.6,
          coolTime:0.5,
          rotate:-Math.PI/12*i,
          radius:0.7,
          bound:0.095,
          shotPTime:0.167*i,
          pos:{x:0,y:1.92-i*0.12}
        }));
      }
      break;
      case 41: // Streamliner
      user.guns = [getGun({
          speed:0.9,
          damage:0.2,
          radius:0.7,
          bound:0.2,
          shotPTime:0,
          pos:{x:0,y:2.25},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:0.9,
          damage:0.2,
          radius:0.7,
          bound:0.2,
          shotPTime:0.2,
          pos:{x:0,y:2.25},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:0.9,
          damage:0.2,
          radius:0.7,
          bound:0.2,
          shotPTime:0.4,
          pos:{x:0,y:2.25},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:0.9,
          damage:0.2,
          radius:0.7,
          bound:0.2,
          shotPTime:0.6,
          pos:{x:0,y:2.25},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      }),getGun({
          speed:0.9,
          damage:0.2,
          radius:0.7,
          bound:0.2,
          shotPTime:0.8,
          pos:{x:0,y:2.25},
          dir:{rotate:null,rotateDistance:Math.PI/240,distance:0}
      })];
      break;
      case 42: // AutoTrapper
      break;
      case 43: // BasicDominator
      user.maxStats = [0,0,0,0,0,0,0,0];
      break;
      case 44: // GunnerDominator
      user.maxStats = [0,0,0,0,0,0,0,0];
      break;
      case 45: // TrapperDominator
      user.maxStats = [0,0,0,0,0,0,0,0];
      break;
      case 46: // BattleShip
      break;
      case 47: // Annihilator
      user.guns = [getGun({
          speed:0.75,
          damage:3,
          health:2,
          radius:2.3,
          bound:17,
          bulletBound:0.1,
          coolTime:0.25,
          pos:{x:0,y:1.88}
      })];
      break;
      case 48: // AutoSmasher
      user.maxStats = [10,10,10,10,10,10,10,10];
      break;
      case 49: // Spike
      user.maxStats = [10,10,10,0,0,0,0,10];
      user.guns = [];
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
