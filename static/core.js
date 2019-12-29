function System(){ // 게임의 전체 진행 담당
  "use strict";

  this.objectList = {tank:{}};
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

  this.colorList = [
    new RGB(230,176,138),
    new RGB(228,102,233),
    new RGB(148,102,234),
    new RGB(103,144,234),
    new RGB(234,178,102),
    new RGB(231,103,98),
    new RGB(147,234,103),
    new RGB(103,233,233)
  ];

  this.tick = 0;
  this.lastTime = Date.now();

  this.input = {
    isMouseOverUi: false,
    shot: 0,
    moveRotate: null,
    w: false,
    a: false,
    s: false,
    d: false,
    k: false,
    target: {
      x:0,
      y:0
    }
  };

  this.drawObject = new DrawObject();

  this.createTankObject = function (id,type){
    let obj = new type();
    this.objectList.tank[id]=obj;
    this.objectList.tank[id].setId(id);
    return obj;
  }

  this.createUiObject = function (type){
    let obj = new type();
    this.uiObjectList.push(obj);
    return obj;
  }

  this.removeObject = function (id,type){
    switch (type){
      case "tank":
        this.objectList.tank[id] = null;
      break;
      default:
      break;
    }
  }

  this.controlTank;

  socket.emit('login');

  socket.on('spawn',(data) => {
    this.controlTank = this.createTankObject(data.id,this.tankList[data.type]);
    this.controlTank.setPosition(data.x,data.y);
    this.controlTank.setName(data.name);
  });

  socket.on('objectList', (tankList) => {
    for (let key in tankList){ // 탱크 지정
      if (tankList[key]){
        if (this.objectList.tank[tankList[key].id]){
          let objTank = this.objectList.tank[tankList[key].id];
          objTank.setRadius(tankList[key].radius);
          if (objTank.id == this.controlTank.id){
            objTank.setPosition(tankList[key].x,tankList[key].y);
          }
          else{
            objTank.setPosition(tankList[key].x,tankList[key].y);
            objTank.setRotate(tankList[key].rotate);
          }
        }
        else{
          let objTank = this.createTankObject(tankList[key].id,this.tankList[tankList[key].type]);
          objTank.setPosition(tankList[key].x,tankList[key].y);
          objTank.setName(tankList[key].name);
          objTank.setRadius(tankList[key].radius);
          objTank.setRotate(tankList[key].rotate);
        }
      }
    }
  });

  socket.on('objectDead', (type,data) => {
    switch(type){
      case "tank":
      this.objectList.tank[data.id].dead();
      break;
      default:
      break;
    }
  });

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


    if (this.controlTank){
      this.showTankLevel.setPosition(whz[0]/2,whz[1]-50 * whz[2],0);
      this.showTankLevel.setText(this.controlTank.name);
      this.showTankLevel.setSize(20);
    }
/*
    this.showUpgradeTank[0].setPosition(43.3*whz[2],62.3*whz[2],122.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[0].setColor(new RGB(166,248,244));
    //new RGB(145,248,244);
    this.showUpgradeTank[1].setPosition(139.3*whz[2],62.3*whz[2],218.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[1].setColor(new RGB(181,248,145));
    this.showUpgradeTank[2].setPosition(43.3*whz[2],154.3*whz[2],122.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[2].setColor(new RGB(248,145,146));
    this.showUpgradeTank[3].setPosition(139.3*whz[2],154.3*whz[2],218.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[3].setColor(new RGB(248,230,146));
    this.showUpgradeTank[4].setPosition(43.3*whz[2],246.3*whz[2],122.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[4].setColor(new RGB(145,178,247));
    this.showUpgradeTank[5].setPosition(139.3*whz[2],246.3*whz[2],218.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[5].setColor(new RGB(181,146,248));*/
  }

  this.loop = function (){
    this.tick = Date.now() - this.lastTime;
    this.lastTime = Date.now();

    if (this.controlTank){
      this.drawObject.cameraSet(this.controlTank);
    }

    this.uiSet();

    for (let key in this.objectList.tank){
      if (this.objectList.tank[key]){
        this.objectList.tank[key].animate(null,this.tick);
      }
    }

    this.drawObject.backgroundDraw();
    this.drawObject.objectDraw(this.objectList.tank);
    this.drawObject.uiDraw(this.uiObjectList);

    requestAnimationFrame(this.loop.bind(this));
  }
  this.loop();

  window.onmousemove = function (e){
    let x = e.clientX * window.devicePixelRatio;
    let y = e.clientY * window.devicePixelRatio;

    this.input.target = {x:x,y:y};
    this.input.isMouseOverUi = false;

    for (let i=0;i<this.uiObjectList.length;i++){
      if (this.uiObjectList[i].inMousePoint(x,y)){
        this.input.isMouseOverUi = true;
      }
    }

    let camera = this.drawObject.getCameraSet();

    if (this.controlTank) {
      this.controlTank.setRotate(Math.atan2(y/camera.z+camera.y-this.controlTank.y,x/camera.z+camera.x-this.controlTank.x));
    }
    socket.emit('mousemove',{x:x/camera.z+camera.x,y:y/camera.z+camera.y});

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
      break;
      case 87: // W키
        this.input.moveRotate = -Math.PI / 2;
      break;
      case 65: // A키
        this.input.moveRotate = Math.PI;
      break;
      case 83: // S키
        this.input.moveRotate = Math.PI / 2;
      break;
      case 68: // D키
        this.input.moveRotate = 0;
      break;
      case 75: // K키
        //this.input.k = true;
      break;
      case 79: // O키
      break;
      case 220: // \키
        //this.controlTank.changeTank(this.tankList[Math.floor(Math.random()*(this.tankList.length-1))]);
      break;
      default:
      break;
    }
    socket.emit('input',this.input);
  }.bind(this);

  window.onkeyup = function (e){
    switch (e.keyCode){
      case 32: // Space키
      break;
      case 87: // W키
        this.input.moveRotate = null;
      break;
      case 65: // A키
        this.input.moveRotate = null;
      break;
      case 83: // S키
        this.input.moveRotate = null;
      break;
      case 68: // D키
        this.input.moveRotate = null;
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
    socket.emit('input',this.input);
  }.bind(this);
}
