function System(){ // 게임의 전체 진행 담당
  "use strict";

  this.objectList = [];
  this.uiObjectList = [];

  this.tankList = [
    Basic,
    Twin,
    Triplet,
    TripleShot,
    QuadTank,
    OctoTank,
    Sniper,
    MachineGun,
    FlankGuard,
    TriAngle,
    Destroyer
  ];

  this.colorList = [];

  this.tick = 0;
  this.lastTime = Date.now();

  this.input = {
    isMouseOverUi: false,
    shot: 0,
    k: false
  };

  this.drawObject = new DrawObject();

  this.createObject = function (type){
    let obj = new type();
    this.objectList.push(obj);
    return obj;
  }

  this.createUiObject = function (type){
    let obj = new type();
    this.uiObjectList.push(obj);
    return obj;
  }

  this.controlTank = this.createObject(this.tankList[Math.floor(Math.random()*(this.tankList.length-1))]);
  this.showTankLevel = this.createUiObject(Text);
  this.showUpgradeTank = [
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button)
  ];

  this.uiSet = function (){
    let whz = this.drawObject.getCanvasSize();

    this.showTankLevel.setPosition(whz[0]/2,whz[1]-50 * whz[2],0);
    this.showTankLevel.setText(this.controlTank.lv);
    this.showTankLevel.setSize(20);

    this.showUpgradeTank[0].setPosition(43.3*whz[2],62.3*whz[2],122.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[0].setColor(new RGB(166,248,244));
    this.showUpgradeTank[1].setPosition(139.3*whz[2],62.3*whz[2],218.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[1].setColor(new RGB(166,248,244));
    this.showUpgradeTank[2].setPosition(43.3*whz[2],154.3*whz[2],122.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[2].setColor(new RGB(166,248,244));
    this.showUpgradeTank[3].setPosition(139.3*whz[2],154.3*whz[2],218.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[3].setColor(new RGB(166,248,244));
    this.showUpgradeTank[4].setPosition(43.3*whz[2],246.3*whz[2],122.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[4].setColor(new RGB(166,248,244));
    this.showUpgradeTank[5].setPosition(139.3*whz[2],246.3*whz[2],218.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[5].setColor(new RGB(166,248,244));
  }

  this.loop = function (){
    this.tick = Date.now() - this.lastTime;
    this.lastTime = Date.now();

    if (this.input.shot) this.controlTank.hit(0.09);
    if (this.input.k) this.controlTank.levelUP();

    this.uiSet();

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

  window.onmousemove = function (e){
    let x = e.clientX;
    let y = e.clientY;

    this.input.isMouseOverUi = false;

    for (let i=0;i<this.uiObjectList.length;i++){
      if (this.uiObjectList[i].inMousePoint(x,y)){
        this.input.isMouseOverUi = true;
      }
    }

    if (this.input.isMouseOverUi){
      this.drawObject.setCursor("pointer");
    }
    else{
      this.drawObject.setCursor("default");
    }
  }.bind(this);

  window.onmousedown = function (e){
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
        this.input.shot = true;
      break;
      case 75: // K키
        //this.input.k = true;
      break;
      case 79: // O키
      break;
      case 220: // \키
        this.controlTank.changeTank(this.tankList[Math.floor(Math.random()*(this.tankList.length-1))]);
      break;
      default:
      break;
    }
  }.bind(this);

  window.onkeyup = function (e){
    switch (e.keyCode){
      case 32: // Space키
        this.input.shot = false;
      break;
      case 75: // K키
        //this.input.k = false;
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
