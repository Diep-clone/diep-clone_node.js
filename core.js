function System(){ // 게임의 전체 진행 담당
  this.objectList = [];
  this.uiObjectList = [];

  this.tick = 0;
  this.lastTime = Date.now();

  this.controlTank = new tanklist[Math.ceil(Math.random()*(tanklist.length-1))]();
  this.objectList.push(this.controlTank);

  this.drawObject = new DrawObject();

  this.createObject = function (){

  }

  this.loop = function (){
    this.tick = Date.now() - this.lastTime;
    this.lastTime = Date.now();

    for (let i=0;i<this.objectList.length;i++){
      if (this.objectList[i]){
        this.objectList[i].animate(null,this.tick);
      }
    }

    this.drawObject.cameraSet(this.controlTank);
    this.drawObject.backgroundDraw();
    this.drawObject.objectDraw(this.objectList);
    this.drawObject.uiDraw(this.uiObjectList);

    requestAnimationFrame(this.loop.bind(this));
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
  }.bind(this);

  window.onkeydown = function(e){
    switch (e.keyCode){
      case 32: // Space키
      break;
      case 75: // K키
        this.controlTank.levelUP();
      break;
      case 79: // O키
      break;
      case 220: // \키
      break;
      default:
      break;
    }
  }.bind(this);
}
