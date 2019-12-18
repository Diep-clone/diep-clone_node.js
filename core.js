function AnimateObject(){
  this.object_list = [];
  
}

var object_list = [];
var tanktype = 0;

var im_count = 0;

window.onmousedown = function(e){
  switch (e.button){
    case 0:
      var tank = new tanklist[tanktype];

      object_list.push(tank);
      tank.x=e.clientX / camera.z * window.devicePixelRatio;
      tank.y=e.clientY / camera.z * window.devicePixelRatio;
      tank.id = object_list.length-1;
      tank.radius = 13; // 13 : 1렙 크기, 20 : 45렙 크기
      tank.rotate = -1;
      tank.opacity = 1;

      im_count++;
    break;
    case 1:
    break;
    case 2:
    break;
    default:
    break;
  }
}

window.onkeydown = function(e){
  switch (e.keyCode){
    case 32: // Space키
      for (var i=0;i<object_list.length;i++){
        if (object_list[i]) object_list[i].keydown();
      }
    break;
    case 75: // K키
      for (var i=0;i<object_list.length;i++){
        if (object_list[i]) object_list[i].levelUP();
      }
    break;
    case 79: // O키
      for (var i=0;i<object_list.length;i++){
        if (object_list[i]) object_list[i].isDead = true;
      }
      im_count = 0;
    break;
    case 220: // \키
      tanktype=(tanktype+1)%tanklist.length;
    break;
    default:
    break;
  }
}

var tick = 0;
var last_time = Date.now();


function loop(){
  if (canvas.width<canvas.height/9*16) camera.z=canvas.height/900*2; // 화면 크기에 따른 줌값 조정
  else camera.z=canvas.width/1600*2;
  
  tick = Date.now() - last_time;
  last_time = Date.now();
  
  for (var i=0;i<object_list.length;i++){
    if (object_list[i]){
      object_list[i].animate();
    }
  }
}

//loop();
setInterval(loop, 20);
