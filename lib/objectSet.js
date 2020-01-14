'use strict';

exports.moveObject = function(obj){ // 오브젝트의 움직임
  obj.x+=obj.dx;
  obj.y+=obj.dy;
  obj.dx*=0.97;
  obj.dy*=0.97;
}

exports.healObject = function (obj){
  if (Date.now()-30000>obj.hitTime){
    obj.health=Math.min(obj.health+obj.maxHealth/1000*60/10,obj.maxHealth);
  }
}
