function System(){ // 게임의 전체 진행 담당
  this.objectList = [];
  this.uiObjectList = [];

  this.tick = 0;
  this.lastTime = Date.now();

  this.keyPress = {
    shot: 0,
    k: false
  };

  this.drawObject = new DrawObject();

  this.createObject = function (type){
    let obj = new type();
    this.objectList.push(obj);
    return obj;
  }

  this.controlTank = this.createObject(tanklist[Math.ceil(Math.random()*(tanklist.length-1))]);

  this.loop = function (){
    this.tick = Date.now() - this.lastTime;
    this.lastTime = Date.now();

    if (this.keyPress.k) this.controlTank.levelUP();

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

    let isClickUi = false;

    for (let i=0;i<this.uiObjectList.length;i++){
      if (this.uiObjectList[i].inMousePoint(x,y)){
        isClickUi = true;
      }
    }

    if (!isClickUi){
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
  }.bind(this);

  window.onmouseup = function (e){
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
        this.keyPress.k = true;
      break;
      case 79: // O키
      break;
      case 220: // \키
      break;
      default:
      break;
    }
  }.bind(this);

  window.onkeyup = function (e){
    switch (e.keyCode){
      case 32: // Space키
      break;
      case 75: // K키
        this.keyPress.k = false;
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
