function System(){ // 게임의 전체 진행 담당
  this.objectList = [];
  this.uiObjectList = [];

  this.tick = 0;
  this.lastTime = Date.now();

  this.controlTank = new tanklist[Math.ceil(Math.random()*(tanklist.length-1))]();

  this.createObject = function (){

  }
  this.cameraMove = function (){
    if (this.controlTank){
      if (this.canvas.width<this.canvas.height/9*16) this.camera.z=this.canvas.height/900*1.78;
      else this.camera.z=this.canvas.width/1600*1.78;

      this.camera.x=(this.controlTank.x-this.canvas.width/2/this.camera.z);
      this.camera.y=(this.controlTank.y-this.canvas.height/2/this.camera.z);
    }
  }

  this.loop = function (){
    tick = Date.now() - last_time;
    last_time = Date.now();

    for (var i=0;i<object_list.length;i++){
      if (object_list[i]){
        object_list[i].animate();
      }
    }

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
