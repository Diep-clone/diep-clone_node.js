'use strict';

const util = require('./librarys');
const utilObj = require('./objectSet');

let bulletId = 0; // 총알 고유 아이디.

exports.bulletSet = function(user){ // 유저의 총알 발사
  let bullets = [];
  for (let i=0;i<user.guns.length;i++){
    if (user.mouse.left || user.guns[i].autoShot){
      if (user.guns[i].life === -1 && user.bulletCount === user.bulletLimits) user.guns[i].shotTime = 0.01;
      if (user.guns[i].shotTime <= 0 && !user.guns[i].isShot && user.guns[i].shotPTime>0){
        user.guns[i].isShot = true;
        user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000 * user.guns[i].shotPTime;
      }
      if (user.guns[i].shotTime <= 0){
        let rotate = user.guns[i].dir.rotate===null?user.rotate+user.guns[i].rotate:user.guns[i].dir.rotate;
        rotate += util.randomRange(-user.guns[i].dir.rotateDistance,user.guns[i].dir.rotateDistance);
        if (user.guns[i].life === -1) user.bulletCount++;
        bullets.push({
            type: user.guns[i].bulletType,
            objType: 'bullet',
            id: bulletId++,
            owner: user.id,
            ownerTank: user,
            ownerType: user.type,
            x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            w: 10,
            h: 10,
            rotate: rotate,
            dx: Math.cos(rotate) * 4 * user.guns[i].speed,
            dy: Math.sin(rotate) * 4 * user.guns[i].speed,
            speed: 0.8 * user.guns[i].speed,
            health: (8 + 6 * user.stats[4]) * user.guns[i].health,
            maxHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            lastHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            damage: (7 + 3 * user.stats[5]) * user.guns[i].damage,
            radius: 0.4 * user.guns[i].radius * user.radius,
            time: 1000 * user.guns[i].life,
            isCollision: false,
            hitTime: Date.now()
        });
        user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000;
      }
    }
    else{
      if (user.guns[i].isShot === true && user.guns[i].shotTime <= 0){
        user.guns[i].isShot = false;
      }
    }
    if (user.guns[i].shotTime > 0) user.guns[i].shotTime -= 1000/60;
  }
  return bullets;
}

exports.isDeadBullet = function(obj,bullets){ // 죽었는가?
  obj.isCollision = false;
  if (obj.ownerTank.isDead === true || (obj.ownerTank.type !== obj.ownerType && obj.time < 0)
  || obj.time === 0 || obj.health <= 0){
    if (util.findIndex(bullets,obj.id) > -1){
      if (obj.time < 0) obj.ownerTank.bulletCount--;
      bullets.splice(util.findIndex(bullets,obj.id),1);
      return true;
    }
  }
  return false;
}

exports.moveBullet = function(b,mapSize){ // 총알의 움직임
  switch(b.type){
    case 1:
      b.dx+=Math.cos(b.rotate) * 0.07 * b.speed;
      b.dy+=Math.sin(b.rotate) * 0.07 * b.speed;
      break;
    case 2:
      let dir;
      if (b.ownerTank.mouse.left){
        dir = Math.atan2(b.ownerTank.target.y-b.y,b.ownerTank.target.x-b.x);
      }
      else if (b.ownerTank.mouse.right){
        dir = Math.atan2(b.y-b.ownerTank.target.y,b.x-b.ownerTank.target.x);
      }
      if (dir){
        b.dx+=Math.cos(dir) * 0.07 * b.speed;
        b.dy+=Math.sin(dir) * 0.07 * b.speed;

        let ccw = util.ccw(Math.cos(dir),Math.sin(dir),Math.cos(b.rotate),Math.sin(b.rotate),0,0);
        let a = -((Math.cos(b.rotate)*Math.cos(dir)) + (Math.sin(b.rotate)*Math.sin(dir))-1) * Math.PI / 2;

        if (ccw > 0){
          b.rotate-= a / 3;
        } else if (ccw < 0){
          b.rotate+= a / 3;
        }
      }

      if (b.x>mapSize.x+51.6) b.x=mapSize.x+51.6;
      if (b.x<-mapSize.x-51.6) b.x=-mapSize.x-51.6;
      if (b.y>mapSize.y+51.6) b.y=mapSize.y+51.6;
      if (b.y<-mapSize.y-51.6) b.y=-mapSize.y-51.6;
      break;
    default:
    break;
  }
  utilObj.moveObject(b);
}
