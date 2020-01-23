function System(name){ // 게임의 전체 진행 담당
  "use strict";

  this.objectList = {tank:{},bullet:{}};
  this.uiObjectList = [];

  this.tankList = [
    Basic, //// 구현 완료
    Twin, ////
    Triplet, ////
    TripleShot, ////
    QuadTank, ////
    OctoTank, ////
    Sniper, ////
    MachineGun, ////
    FlankGuard, ////
    TriAngle, ////
    Destroyer, ////
    Overseer,////
    Overload,////
    TwinFlank,////
    PentaShot,////
    Assasin,////
    ArenaCloser,/// 디자인만 완료
    Necromanser,///
    TripleTwin,////
    Hunter,////
    Gunner,////
    Stalker,///
    Ranger,////
    Booster,////
    Fighter,////
    Hybrid,////
    Manager,///
    MotherShip,///
    Predator,///
    Sprayer,////
    Trapper,///
    GunnerTrapper,///
    OverTrapper,///
    MegaTrapper,///
    TriTrapper,///
    Smasher,///
    Landmine,///
    AutoGunner,///
    Auto5,///
    Auto3,///
    SpreadShot,////
    Streamliner,////
    AutoTrapper,///
    BasicDominator,///
    GunnerDominator,///
    TrapperDominator,///
    BattleShip,///
    Annihilator,////
    AutoSmasher,///
    Spike,///
    Factory,///
    Skimmer,///
    Rocketeer///
  ];

  this.bulletList = [
    TrapBullet,
    BasicBullet,
    DroneBullet
  ]

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
    ctrl: false,
    isMouseOverUi: false,
    shot: 0,
    rShot: 0,
    moveRotate: null,
    moveVector: new Vector(0,0),
    space: false,
    leftMouse: false,
    rightMouse: false,
    w: false,
    a: false,
    s: false,
    d: false,
    o: false,
    k: false,
    e: false,
    c: false,
    autoE: false,
    autoC: false,
    changeTank: false,
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

  this.createBulletObject = function (id,type){
    let obj = new type();
    this.objectList.bullet[id]=obj;
    this.objectList.bullet[id].setId(id);
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
        //delete this.objectList.tank.id;
        this.objectList.tank[id] = null;
      break;
      case "bullet":
        //delete this.objectList.bullet.id;
        this.objectList.bullet[id] = null;
      break;
      default:
      break;
    }
  }

  this.controlTank;

  socket.emit('login', name);

  socket.on('pong!', function(data) {
    console.log('Received Pong: ', Date.now()-data);
  });

  socket.on('spawn',(data) => {
    this.controlTank = this.createTankObject(data.id,this.tankList[data.type]);
    this.controlTank.setPosition(data.x,data.y);
    this.controlTank.setName(data.name);
    this.drawObject.camera = {
      x:(data.x-window.innerWidth * window.devicePixelRatio/2/2.3),
      y:(data.y-window.innerHeight * window.devicePixelRatio/2/2.3),
      z:1,
      uiz:1
    };
  });

  socket.on('objectList', (tankList,bulletList) => {
    for (let key in tankList){ // 탱크 지정
      if (tankList[key]){
        if (this.objectList.tank[tankList[key].id]){
          let objTank = this.objectList.tank[tankList[key].id];
          objTank.setRadius(tankList[key].radius);
          objTank.setPosition(tankList[key].x,tankList[key].y);
          objTank.setDPosition(tankList[key].dx,tankList[key].dy);
          objTank.setHealth(tankList[key].health,tankList[key].maxHealth);
          let tankType = new this.tankList[tankList[key].type]().tankType;
          if (tankType != objTank.tankType)
            objTank.changeTank(this.tankList[tankList[key].type]);
          objTank.setCanDir(tankList[key].isCanDir);
          if (objTank.id === this.controlTank.id){
            objTank.setLevel(tankList[key].level);
            this.drawObject.setSight(tankList[key].sight);
          }
          if (!tankList[key].isCanDir){
            objTank.setRotate(tankList[key].rotate);
          }
        }
        else{
          let objTank = this.createTankObject(tankList[key].id,this.tankList[tankList[key].type]);
          objTank.setPosition(tankList[key].x,tankList[key].y);
          objTank.setName(tankList[key].name);
          objTank.setRadius(tankList[key].radius);
          objTank.setRotate(tankList[key].rotate);
          objTank.setHealth(tankList[key].health,tankList[key].maxHealth);
          objTank.setColor(new RGB(241,78,84));
        }
      }
    }
    for (let key in bulletList){ // 총알 지정
      if (bulletList[key]){
        if (this.objectList.bullet[bulletList[key].id]){
          let objBullet = this.objectList.bullet[bulletList[key].id];
          objBullet.setRadius(bulletList[key].radius);
          objBullet.setPosition(bulletList[key].x,bulletList[key].y);
          objBullet.setDPosition(bulletList[key].dx,bulletList[key].dy);
          objBullet.setRotate(bulletList[key].rotate);
        }
        else{
          let objBullet = this.createBulletObject(bulletList[key].id,this.bulletList[bulletList[key].type],bulletList[key].owner);
          objBullet.setPosition(bulletList[key].x,bulletList[key].y);
          objBullet.setRadius(bulletList[key].radius);
          objBullet.setRotate(bulletList[key].rotate);
          if (bulletList[key].owner !== this.controlTank.id){
            objBullet.setColor(new RGB(241,78,84));
          }
        }
      }
    }
  });

  socket.on('objectHit', (data) => { // 피격 효과 전달
    switch(data.objType){
      case "tank":
        if (this.objectList.tank[data.id]){
          this.objectList.tank[data.id].hit();
        }
      break;
      case "bullet":
        if (this.objectList.bullet[data.id]){
          this.objectList.bullet[data.id].hit();
        }
      default:
      break;
    }
  })

  socket.on('objectDead', (data) => { // 죽었다는 신호 전달
    switch(data.objType){
      case "tank":
        if (this.objectList.tank[data.id]){
          this.objectList.tank[data.id].dead();
        }
      break;
      case "bullet":
        if (this.objectList.bullet[data.id]){
          this.objectList.bullet[data.id].dead();
        }
      default:
      break;
    }
  });

  this.showTankLevel = this.createUiObject(Text);
  this.showTankName = this.createUiObject(Text);

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
      this.showTankLevel.setPosition(whz[0]/2,whz[1]-100 * whz[2],0);
      this.showTankLevel.setText(this.controlTank.level);
      this.showTankLevel.setSize(20);
      this.showTankName.setPosition(whz[0]/2,whz[1]-50 * whz[2],0);
      this.showTankName.setText(this.controlTank.name);
      this.showTankName.setSize(20);
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

    socket.emit('ping!',Date.now());

    this.uiSet();

    for (let key in this.objectList.tank){
      if (this.objectList.tank[key]){
        this.objectList.tank[key].animate(this.tick);
      }
    }

    for (let key in this.objectList.bullet){
      if (this.objectList.bullet[key]){
        this.objectList.bullet[key].animate(this.tick);
      }
    }

    let camera = this.drawObject.getCameraSet();

    if (this.controlTank) {
      this.drawObject.cameraSet(this.controlTank);

      if (this.controlTank.isCanDir){
        this.controlTank.setRotate(Math.atan2(this.input.target.y/camera.z+camera.y-this.controlTank.y-this.controlTank.dy,this.input.target.x/camera.z+camera.x-this.controlTank.x-this.controlTank.dx));
      }
      socket.emit('mousemove',{
        x:this.input.target.x/camera.z+camera.x,
        y:this.input.target.y/camera.z+camera.y
      });
    }

    this.drawObject.backgroundDraw();
    this.drawObject.objectDraw(this.objectList.bullet);
    this.drawObject.objectDraw(this.objectList.tank);
    this.drawObject.objectStatusDraw(this.objectList.tank);
    this.drawObject.uiDraw(this.uiObjectList);

    requestAnimationFrame(this.loop.bind(this));
  }
  this.loop();

  this.lastPos = {x:0,y:0};

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
/*
    if (this.input.leftMouse){
      this.drawObject.cameraMove(this.lastPos.x-this.input.target.x,this.lastPos.y-this.input.target.y);
    }*/

    if (this.input.isMouseOverUi){
      this.drawObject.setCursor("pointer");
    }
    else{
      this.drawObject.setCursor("default");
    }

    this.lastPos.x = x;
    this.lastPos.y = y;
  }.bind(this);

  this.setMoveRotate = function (){
    this.input.moveRotate = (this.input.moveVector.mag()>0)?Math.atan2(this.input.moveVector.y,this.input.moveVector.x):null;
  }

  window.onmousedown = function (e){
    let camera = this.drawObject.getCameraSet();

    switch (e.button){
      case 0: // 좌클릭
      if (!this.input.leftMouse){
        this.input.shot++;
        this.input.leftMouse = true;
      }
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      if (!this.input.rightMouse){
        this.input.rShot++;
        this.input.rightMouse = true;
      }
      break;
      default:
      break;
    }
/*
    if (this.input.leftMouse){
      this.drawObject.cameraMove({
        x:this.input.target.x/camera.z+camera.x,
        y:this.input.target.y/camera.z+camera.y
      });
    }
*/
    socket.emit('input',this.input);

    return false;
  }.bind(this);

  window.oncontextmenu = function (e){
    return false;
  }.bind(this);

  window.onmouseup = function (e){
    switch (e.button){
      case 0: // 좌클릭
      if (this.input.leftMouse){
        this.input.shot--;
        this.input.leftMouse = false;
      }
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      if (this.input.rightMouse){
        this.input.rShot--;
        this.input.rightMouse = false;
      }
      break;
      default:
      break;
    }
    socket.emit('input',this.input);
  }.bind(this);

  window.onkeydown = function(e){
    let g = false;
    switch (e.keyCode){
      case 16: // Shift키
      if (!this.input.shift){
        this.input.rShot++;
        g = this.input.shift = true;
      }
      break;
      case 17: // Ctrl키
      if (!this.input.ctrl){
        g = this.input.ctrl = true;
      }
      break;
      case 32: // Space키
      if (!this.input.space){
        this.input.shot++;
        g = this.input.space = true;
      }
      break;
      case 38: // 위쪽 방향키
      case 87: // W키
        if (!this.input.w){
          this.input.moveVector.y-=1;
          g = this.input.w=true;
        }
      break;
      case 37: // 왼쪽 방향키
      case 65: // A키
        if (!this.input.a){
          this.input.moveVector.x-=1;
          g = this.input.a=true;
        }
      break;
      case 40: // 아래쪽 방향키
      case 83: // S키
        if (!this.input.s){
          this.input.moveVector.y+=1;
          g = this.input.s=true;
        }
      break;
      case 39: // 오른쪽 방향키
      case 68: // D키
        if (!this.input.d){
          this.input.moveVector.x+=1;
          g = this.input.d=true;
        }
      break;
      case 69:
      if (!this.input.e){
        this.input.autoE=1-this.input.autoE;
        g = this.input.e=true;
      }
      break;
      case 67: // C키
      if (!this.input.c){
        this.input.autoC=1-this.input.autoC;
        g = this.input.c=true;
      }
      break;
      case 75: // K키
      if (!this.input.k){
        g = this.input.k = true;
      }
      break;
      case 79: // O키
      if (!this.input.o){
        g = this.input.o = true;
      }
      break;
      case 188:
      break;
      case 190:
      break;
      case 220: // \키
        if (!this.input.changeTank){
          console.log(this.input.changeTank);
          g = this.input.changeTank = true;
        }
      break;
      default:
      break;
    }
    this.setMoveRotate();
    if (g) socket.emit('input',this.input);
  }.bind(this);

  window.onkeyup = function (e){
    switch (e.keyCode){
      case 16: // Shift키
        this.input.rShot--;
        this.input.shift = false;
      break;
      case 17: // Ctrl키
        this.input.ctrl = false;
      break;
      case 32: // Space키
        this.input.shot--;
        this.input.space = false;
      break;
      case 38: // 위쪽 방향키
      case 87: // W키
        this.input.moveVector.y+=1;
        this.input.w=false;
      break;
      case 37: // 왼쪽 방향키
      case 65: // A키
        this.input.moveVector.x+=1;
        this.input.a=false;
      break;
      case 40: // 아래쪽 방향키
      case 83: // S키
        this.input.moveVector.y-=1;
        this.input.s=false;
      break;
      case 39: // 오른쪽 방향키
      case 68: // D키
        this.input.moveVector.x-=1;
        this.input.d=false;
      break;
      case 69: // E키
        this.input.e=false;
      break;
      case 67: // C키
        this.input.c=false;
      break;
      case 75: // K키
        this.input.k = false;
      break;
      case 79: // O키
        this.input.o = false;
      break;
      case 220: // \키
        this.input.changeTank = false;
      break;
      default:
      break;
    }
    if (!this.input.w && !this.input.a && !this.input.s && !this.input.d) this.input.moveVector = new Vector(0,0);
    this.setMoveRotate();
    socket.emit('input',this.input);
  }.bind(this);
}
