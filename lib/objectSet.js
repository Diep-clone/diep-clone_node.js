'use strict';

exports.moveObject = function(obj){ // 오브젝트의 움직임
  obj.x+=obj.dx;
  obj.y+=obj.dy;
  obj.dx*=0.97;
  obj.dy*=0.97;
}
