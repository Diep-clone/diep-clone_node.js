function System(){ // 게임의 전체 진행 담당
  this.objectList = [];
  this.uiObjectList = [];

  this.tick = 0;
  this.lastTime = Date.now();

  this.controlTank = new tanklist[Math.ceil(Math.random()*(tanklist.length-1))]();

  this.drawObject = new DrawObject();

  this.createObject = function (){

  }

  this.loop = function (){
    tick = Date.now() - last_time;
    last_time = Date.now();

    for (var i=0;i<object_list.length;i++){
      if (object_list[i]){
        object_list[i].animate();
      }
    }

    drawObject.cameraSet(this.controlTank);
    drawObject.backgroundDraw();
    drawObject.objectDraw();
    drawObject.uiDraw();

    requestAnimationFrame(this.loop);
  }
  this.loop();

  window.onmousedown = function (e){
    let x = e.clientX;
    let y = e.clientY;

    switch (e.button){
      case 0: // 좌클릭
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      break;
      default:
      break;
    }
  }

  window.onkeydown = function(e){
    switch (e.keyCode){
      case 32: // Space키
      break;
      case 75: // K키
      break;
      case 79: // O키
      break;
      case 220: // \키
      break;
      default:
      break;
    }
  }
}
