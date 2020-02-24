function System(name){ // 게임의 전체 진행 담당
  "use strict";

  this.objectList = {obj:{},bul:{}};
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
    Necromanser,////
    TripleTwin,////
    Hunter,////
    Gunner,////
    Stalker,////
    Ranger,////
    Booster,////
    Fighter,////
    Hybrid,////
    Manager,////
    MotherShip,////
    Predator,////
    Sprayer,////
    Trapper,////
    GunnerTrapper,////
    OverTrapper,////
    MegaTrapper,////
    TriTrapper,////
    Smasher,////
    Landmine,////
    AutoGunner,///
    Auto5,///
    Auto3,///
    SpreadShot,////
    Streamliner,////
    AutoTrapper,///
    BasicDominator,////
    GunnerDominator,////
    TrapperDominator,////
    BattleShip,////
    Annihilator,////
    AutoSmasher,///
    Spike,////
    Factory,////
    Skimmer,////
    Rocketeer////
  ];

  this.bulletList = [
    TrapBullet,
    BasicBullet,
    DroneBullet,
    Minion,
    SkimmerBullet,
    RocketeerBullet
  ]

  this.shapeList = [
    Square,
    Triangle,
    Pentagon,
    Pentagon,
    Triangle,
    Triangle
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
  this.isControlRotate = true;

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
    num:[false,false,false,false,false,false,false,false],
    o: false,
    k: false,
    l: false,
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

  this.createObject = function (id,type,radius,rotate){
    let obj = new type(radius,rotate);
    this.objectList.obj[id]=obj;
    this.objectList.obj[id].setId(id);
    return obj;
  }

  this.createBulletObject = function (id,type,radius,rotate){
    let obj = new type(radius,rotate);
    this.objectList.bul[id]=obj;
    this.objectList.bul[id].setId(id);
    return obj;
  }

  this.createUiObject = function (obj){
    this.uiObjectList.push(obj);
    return obj;
  }

  this.removeObject = function (id,type){
    switch (type){
      case "obj":
        this.objectList.obj[id] = null;
      break;
      case "bul":
        this.objectList.bul[id] = null;
      break;
      default:
      break;
    }
  }

  this.controlTank;
  this.stat;
  this.stats;
  this.maxStats;
  this.ping;

  socket.emit('login', name);

  socket.on('pong!', function(data) {
    this.ping = Date.now()-data;
  }.bind(this));

  socket.on('spawn',(data) => {
    this.controlTank = this.createObject(data.id,this.tankList[data.type]);
    this.controlTank.setPosition(data.x,data.y);
    this.controlTank.setName(data.name);
    this.drawObject.camera = {
      x:(data.x-this.drawObject.canvas.width / 2 / this.drawObject.camera.uiz / data.sight),
      y:(data.y-this.drawObject.canvas.height / 2 / this.drawObject.camera.uiz / data.sight),
      z:2,
      uiz:1
    };
  });

  socket.on('playerSet',(data)=>{
    this.controlTank.setLevel(data.level);
    this.drawObject.setSight(data.camera.z);
    this.drawObject.cameraSet(data.camera);
    this.isControlRotate = data.isRotate;
    this.stat = data.stat;
    this.stats = data.stats;
    this.maxStats = data.maxStats;
  });

  socket.on('objectList', (objectList) => {
    for (let key in objectList){ // 탱크 지정
      let obj = objectList[key];
      switch (obj.objType){
        case "tank":
        if (this.objectList.obj[obj.id]){
          let objO = this.objectList.obj[obj.id];
          objO.setDead(obj.isDead);
          if (!obj.isDead){
            objO.setRadius(obj.radius);
            objO.setOpacity(obj.opacity);
            objO.setScore(obj.score);
          }
          objO.setPosition(obj.x,obj.y);
          objO.setHealth(obj.health,obj.maxHealth);

          let tankType = new this.tankList[obj.type]().tankType;
          if (tankType != objO.tankType){
            objO.changeTank(this.tankList[obj.type]);
          }
          if (objO !== this.controlTank){
            objO.setRotate(obj.rotate);
          }
        }
        else{
          if (obj.isDead) continue;
          let objO = this.createObject(obj.id,this.tankList[obj.type],obj.radius,obj.rotate);
          objO.setPosition(obj.x,obj.y);
          objO.setName(obj.name);
          objO.setScore(obj.score);
          objO.setRadius(obj.radius);
          objO.setRotate(obj.rotate);
          objO.setHealth(obj.health,obj.maxHealth);
          objO.setColor(new RGB(241,78,84));
        }
        break;
        case "bullet":
        case "drone":
        if (this.objectList.bul[obj.id]){
          let objO = this.objectList.bul[obj.id];
          objO.setDead(obj.isDead);
          if (!obj.isDead){
            objO.setRadius(obj.radius);
          }
          objO.setPosition(obj.x,obj.y);
          objO.setRotate(obj.rotate);
        }
        else{
          if (obj.isDead) continue;
          let objO = this.createBulletObject(obj.id,this.bulletList[obj.type],obj.radius,obj.rotate);
          objO.setPosition(obj.x,obj.y);
          objO.setRadius(obj.radius);
          objO.setRotate(obj.rotate);
          if (obj.owner !== this.controlTank.id){
            objO.setColor(new RGB(241,78,84));
          }
        }
        break;
        case "shape":
        if (this.objectList.obj[obj.id]){
          let objO = this.objectList.obj[obj.id];
          objO.setDead(obj.isDead);
          if (!obj.isDead){
            objO.setRadius(obj.radius);
          }
          objO.setPosition(obj.x,obj.y);
          objO.setRotate(obj.rotate);
          objO.setHealth(obj.health,obj.maxHealth);
        }
        else{
          if (obj.isDead) continue;
          let objO = this.createObject(obj.id,this.shapeList[obj.type],obj.radius,obj.rotate);
          objO.setPosition(obj.x,obj.y);
          objO.setRadius(obj.radius);
          objO.setRotate(obj.rotate);
          objO.setHealth(obj.health,obj.maxHealth);
          let colorList = [
            new RGB(255,232,105),
            new RGB(252,118,118),
            new RGB(118,140,252),
            new RGB(118,140,252),
            new RGB(255,232,105),
            new RGB(255,232,105)
          ];
          objO.setColor(colorList[obj.type]);
        }
        break;
        default:
        break;
      }
    }
  });

  socket.on('objectHit', (id,type) => { // 피격 효과 전달
    switch(type){
      case "tank":
      case "shape":
        if (this.objectList.obj[id]){
          this.objectList.obj[id].hit();
        }
      break;
      case "bullet":
      case "drone":
        if (this.objectList.bul[id]){
          this.objectList.bul[id].hit();
        }
      break;
      default:
      break;
    }
  });

  socket.on('shot', (type,id,gun) => {
    switch(type){
      case "tank":
      case "shape":
        if (this.objectList.obj[id]){
          this.objectList.obj[id].gunAnime(gun);
        }
      break;
      case "bullet":
      case "drone":
        if (this.objectList.bul[id]){
          this.objectList.bul[id].gunAnime(gun);
        }
      break;
      default:
      break;
    }
  });

  this.showTankStat = this.createUiObject(new Text("",20,-Math.PI/8));
  this.showTankStats = this.createUiObject(new Text("",15,0,"left"));

  this.showTankLevel = this.createUiObject(new Text("",20));
  this.showTankScore = this.createUiObject(new Text("",20));
  this.showTankName = this.createUiObject(new Text("",20));

  this.showPing = this.createUiObject(new Text("",12.5,0,"right",false));

  this.showMiniMap = this.createUiObject(new MiniMap());

  this.showUpgradeTank = [
    this.createUiObject(new Button()),
    this.createUiObject(new Button()),
    this.createUiObject(new Button()),
    this.createUiObject(new Button()),
    this.createUiObject(new Button()),
    this.createUiObject(new Button())
  ];

  this.uiSet = function (){
    let whz = this.drawObject.getCanvasSize();

    if (this.controlTank){
      this.showTankStat.setPosition(50,whz[1]-50 * whz[2],0);
      this.showTankStat.setText(this.stat===0?"":"x" + this.stat);
      this.showTankStats.setPosition(25,whz[1]-25 * whz[2],0);
      let tankStats = "";
      if (this.stats){
        for (let i=0;i<this.stats.length;i++){
          tankStats += this.stats[i] + " ";
        }
      }
      this.showTankStats.setText(tankStats);
      this.showTankLevel.setPosition(whz[0]/2,whz[1]-100 * whz[2],0);
      this.showTankLevel.setText(this.controlTank.level);
      this.showTankScore.setPosition(whz[0]/2,whz[1]-75 * whz[2],0);
      this.showTankScore.setText(this.controlTank.score);
      this.showTankName.setPosition(whz[0]/2,whz[1]-50 * whz[2],0);
      this.showTankName.setText(this.controlTank.name);

      this.showPing.setPosition(whz[0]-(21 + 5)*whz[2],whz[1] - (21 + 147 + 5) * whz[2],0);
      this.showPing.setText(String(this.ping)+' ms heroku-newyork');

      if (this.drawObject.mapSize)
      {
        this.showMiniMap.setPosition(whz[0] - 21*whz[2],whz[1] - 21*whz[2]);
        this.showMiniMap.setPointPosition((this.controlTank.x+this.drawObject.mapSize.x)/2/this.drawObject.mapSize.x,(this.controlTank.y+this.drawObject.mapSize.y)/2/this.drawObject.mapSize.y,this.controlTank.rotate);
      }
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

    for (let key in this.objectList.obj){
      if (this.objectList.obj[key]){
        if (this.objectList.obj[key]!==this.controlTank && !this.objectList.obj[key].isInCamera(this.drawObject.getCameraSet())){
          this.removeObject(key,'obj');
          continue;
        }
        this.objectList.obj[key].animate(this.tick);
      }
    }

    for (let key in this.objectList.bul){
      if (this.objectList.bul[key]){
        if (!this.objectList.bul[key].isInCamera(this.drawObject.getCameraSet())){
          this.removeObject(key,'bul');
          continue;
        }
        this.objectList.bul[key].animate(this.tick);
      }
    }

    let camera = this.drawObject.camera;

    if (this.controlTank) {
      let targetX = this.input.target.x/camera.z+camera.x;
      let targetY = this.input.target.y/camera.z+camera.y;
      if (this.input.autoC){
        targetX = Math.cos(this.controlTank.rotate+0.02)*200+this.controlTank.x;
        targetY = Math.sin(this.controlTank.rotate+0.02)*200+this.controlTank.y;
      }
      if (this.isControlRotate){
        this.controlTank.setRotate(Math.atan2(targetY-this.controlTank.y,targetX-this.controlTank.x));
      }
      socket.emit('mousemove',{
        x:targetX,
        y:targetY
      });
    }

    this.drawObject.backgroundDraw();
    this.drawObject.objectDraw(this.objectList.bul);
    this.drawObject.objectDraw(this.objectList.obj);
    this.drawObject.objectStatusDraw(this.objectList.obj);
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
        socket.emit('leftMouse',this.input.autoE || this.input.shot);
        this.input.leftMouse = true;
      }
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      if (!this.input.rightMouse){
        this.input.rShot++;
        socket.emit('rightMouse',this.input.rShot);
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
    return false;
  }.bind(this);

  window.oncontextmenu = function (e){
    return false;
  }.bind(this);

  window.onmouseup = function (e){
    if (this.controlTank){
      switch (e.button){
        case 0: // 좌클릭
        if (this.input.leftMouse){
          this.input.shot--;
          socket.emit('leftMouse',this.input.autoE || this.input.shot);
          this.input.leftMouse = false;
        }
        break;
        case 1: // 마우스 휠 클릭
        break;
        case 2: // 우클릭
        if (this.input.rightMouse){
          this.input.rShot--;
          socket.emit('rightMouse',this.input.rShot);
          this.input.rightMouse = false;
        }
        break;
        default:
        break;
      }
    }
  }.bind(this);

  window.onkeydown = function(e){
    if (this.controlTank){
      switch (e.keyCode){
        case 16: // Shift키
        if (!this.input.shift){
          this.input.rShot++;
          socket.emit('rightMouse',this.input.rShot);
          this.input.shift = true;
        }
        break;
        case 17: // Ctrl키
        if (!this.input.ctrl){
          this.input.ctrl = true;
        }
        break;
        case 32: // Space키
        if (!this.input.space){
          this.input.shot++;
          socket.emit('leftMouse',this.input.autoE || this.input.shot);
          this.input.space = true;
        }
        break;
        case 38: // 위쪽 방향키
        case 87: // W키
          if (!this.input.w){
            this.input.moveVector.y-=1;
            this.setMoveRotate();
            socket.emit('moveRotate',this.input.moveRotate);
            this.input.w=true;
          }
        break;
        case 37: // 왼쪽 방향키
        case 65: // A키
          if (!this.input.a){
            this.input.moveVector.x-=1;
            this.setMoveRotate();
            socket.emit('moveRotate',this.input.moveRotate);
            this.input.a=true;
          }
        break;
        case 40: // 아래쪽 방향키
        case 83: // S키
          if (!this.input.s){
            this.input.moveVector.y+=1;
            this.setMoveRotate();
            socket.emit('moveRotate',this.input.moveRotate);
            this.input.s=true;
          }
        break;
        case 39: // 오른쪽 방향키
        case 68: // D키
          if (!this.input.d){
            this.input.moveVector.x+=1;
            this.setMoveRotate();
            socket.emit('moveRotate',this.input.moveRotate);
            this.input.d=true;
          }
        break;
        case 69: // E키
        if (!this.input.e){
          this.input.autoE=1-this.input.autoE;
          socket.emit('leftMouse',this.input.autoE || this.input.shot);
          this.input.e=true;
        }
        break;
        case 67: // C키
        if (!this.input.c){
          this.input.autoC=1-this.input.autoC;
          this.input.c=true;
        }
        break;
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        if (!this.input.num[e.keyCode-49]){
          socket.emit('stat',e.keyCode-49);
          this.input.num[e.keyCode-49]=true;
        }
        break;
        case 75: // K키
        if (!this.input.k){
          socket.emit('keyK',true);
          this.input.k = true;
        }
        break;
        case 76: // L키
        if (!this.input.l){
          this.showPing.setEnable(true);
          this.input.l = true;
        }
        break;
        case 79: // O키
        if (!this.input.o){
          socket.emit('keyO',true);
          this.input.o = true;
        }
        break;
        case 188:
        break;
        case 190:
        break;
        case 220: // \키
          if (!this.input.changeTank){
            socket.emit('changeTank',true);
            this.input.changeTank = true;
          }
        break;
        default:
        break;
      }
    }
  }.bind(this);

  window.onkeyup = function (e){
    if (this.controlTank){
      switch (e.keyCode){
        case 16: // Shift키
        if (this.input.shift){
          this.input.rShot--;
          socket.emit('rightMouse',this.input.rShot);
          this.input.shift = false;
        }
        break;
        case 17: // Ctrl키
        if (this.input.ctrl){
          this.input.ctrl = false;
        }
        break;
        case 32: // Space키
        if (this.input.space){
          this.input.shot--;
          socket.emit('leftMouse',this.input.autoE || this.input.shot);
          this.input.space = false;
        }
        break;
        case 38: // 위쪽 방향키
        case 87: // W키
        if (this.input.w){
          this.input.moveVector.y+=1;
          this.setMoveRotate();
          socket.emit('moveRotate',this.input.moveRotate);
          this.input.w=false;
        }
        break;
        case 37: // 왼쪽 방향키
        case 65: // A키
        if (this.input.a){
          this.input.moveVector.x+=1;
          this.setMoveRotate();
          socket.emit('moveRotate',this.input.moveRotate);
          this.input.a=false;
        }
        break;
        case 40: // 아래쪽 방향키
        case 83: // S키
        if (this.input.s){
          this.input.moveVector.y-=1;
          this.setMoveRotate();
          socket.emit('moveRotate',this.input.moveRotate);
          this.input.s=false;
        }
        break;
        case 39: // 오른쪽 방향키
        case 68: // D키
        if (this.input.d){
          this.input.moveVector.x-=1;
          this.setMoveRotate();
          socket.emit('moveRotate',this.input.moveRotate);
          this.input.d=false;
        }
        break;
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        if (this.input.num[e.keyCode-49]){
          this.input.num[e.keyCode-49]=false;
        }
        break;
        case 69: // E키
        if (this.input.e){
          this.input.e=false;
        }
        break;
        case 67: // C키
        if (this.input.c){
          this.input.c=false;
        }
        break;
        case 75: // K키
        if (this.input.k){
          socket.emit('keyK',false);
          this.input.k = false;
        }
        break;
        case 76: // L키
        if (this.input.l){
          this.showPing.setEnable(false);
          this.input.l = false;
        }
        break;
        case 79: // O키
        if (this.input.o){
          socket.emit('keyO',false);
          this.input.o = false;
        }
        break;
        case 220: // \키
        if (this.input.changeTank){
          this.input.changeTank = false;
        }
        break;
        default:
        break;
      }
    }
  }.bind(this);
}
