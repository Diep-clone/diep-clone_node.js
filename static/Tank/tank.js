function Tank(){
  "use strict";

  HealthShowObject.apply(this, arguments);
  this.tankType = null;
  this.guns = [];
  this.color = new RGB(0,176,225);
  this.gunColor = new RGB(153,153,153);
  this.name = "";
  this.isDead = false;
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvasSize = {x:0,y:0};
  this.canvasPos = {x:0,y:0};
  this.hitTime = 0;
  this.r = 0;
  this.w = 0;

  this.animate = function(tick){
    if (this.isDead || this.health<0){
      this.opacity = Math.max(this.opacity - 0.2 * tick * 0.05, 0);
      this.radius += 0.4 * tick * 0.05;
      if (this.opacity == 0){
        system.removeObject(this.id,'tank');
        return;
      }
    }
    if (this.hitTime>0){ // hit effect
      this.hitTime -= 0.1 * tick * 0.05;
      this.w= 1;
    }
    else{
      this.hitTime = 0;
      if (this.w>0) this.w = Math.max(this.w - 0.7 * tick * 0.05,0);
      if (this.w==0 && this.r==0){
        this.r = 0.8;
        this.w = -0.0001;
      }
    }
    this.r= Math.max(this.r - 0.2 * tick * 0.05,0);

    for (let i=0;i<this.guns.length;i++){
      this.guns[i].animate();
    }

    //this.x+=this.dx;
    //this.y+=this.dy;
  }
  this.setName = function (name){
    this.name = name;
  }
  this.setColor = function (color){
    this.color = color;
  }
  this.changeTank = function (type){
    let t = new type();
    this.guns = t.guns;
    this.tankType = t.tankType;
    this.upgradeTanks = t.upgradeTanks;
  }
  this.dead = function(){
    this.isDead = true;
  }
  this.hit = function(){
    this.hitTime=0.2;
  }
  this.setCanvasSize = function(camera){
    let xx = ((this.x - this.dx - camera.x) * camera.z) - Math.floor((this.x - this.dx - camera.x) * camera.z);
    let yy = ((this.y - this.dy - camera.y) * camera.z) - Math.floor((this.y - this.dy - camera.y) * camera.z);
    this.canvasSize.x = ((this.radius * 2) * camera.z);
    this.canvasSize.y = ((this.radius * 2) * camera.z);
    this.canvasPos = {x:(this.radius * camera.z + xx),y:(this.radius * camera.z + yy)};
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].setParentCanvasSize(this,camera);
    }
    this.canvas.width = this.canvasSize.x + 4 * camera.z + 4;
    this.canvas.height = this.canvasSize.y + 4 * camera.z + 4;
    this.canvasPos.x += 2 * camera.z + 2;
    this.canvasPos.y += 2 * camera.z + 2;
    this.ctx.lineWidth = 2 * camera.z;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.imageSmoothingEnabled = false;
  }
  this.draw = function(ctx,camera){
    this.setCanvasSize(camera);

    this.ctx.strokeStyle = this.gunColor.getDarkRGB().getRedRGB(this.r).getLightRGB(this.w).getRGBValue(); // 총구 그리기
    this.ctx.fillStyle = this.gunColor.getRedRGB(this.r).getLightRGB(this.w).getRGBValue();
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].drawGun(this,this.ctx,camera);
    }

    this.ctx.strokeStyle = this.color.getDarkRGB().getRedRGB(this.r).getLightRGB(this.w).getRGBValue(); // 몸체 그리기
    this.ctx.fillStyle = this.color.getRedRGB(this.r).getLightRGB(this.w).getRGBValue();
    this.ctx.beginPath();
    //this.ctx.arc(Math.floor(this.canvasPos.x),Math.floor(this.canvasPos.y),this.radius * camera.z,0,Math.PI * 2);
    this.ctx.arc(this.canvasPos.x,this.canvasPos.y,this.radius * camera.z,0,Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    ctx.globalAlpha = this.opacity;
    //ctx.drawImage(this.canvas,(this.x - camera.x) * camera.z-Math.floor(this.canvasPos.x),(this.y - camera.y) * camera.z-Math.floor(this.canvasPos.y));
    ctx.drawImage(this.canvas,((this.x - this.dx - camera.x) * camera.z-this.canvasPos.x),((this.y - this.dy - camera.y) * camera.z-this.canvasPos.y));
    //ctx.putImageData(this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height),((this.x - this.dx - camera.x) * camera.z-this.canvasPos.x),((this.y - this.dy - camera.y) * camera.z-this.canvasPos.y));
  }
}
Tank.prototype = new HealthShowObject();
Tank.prototype.constructor = Tank;


function Basic(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,1.88],[-0.42,1.88],[-0.42, 0]],0)
  ];
  this.tankType = "Basic";
}
Basic.prototype = new Tank();
Basic.prototype.constructor = Basic;


function Twin(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],0)
  ];
  this.tankType = "Twin";
}
Twin.prototype = new Tank();
Twin.prototype.constructor = Twin;


function Triplet(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.6],[0.1,1.6],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.6],[-0.9,1.6],[-0.9, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0)
  ];
  this.tankType = "Triplet";
}
Triplet.prototype = new Tank();
Triplet.prototype.constructor = Triplet;


function TripleShot(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],-Math.PI / 4),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI / 4)
  ];
  this.tankType = "TripleShot";
}
TripleShot.prototype = new Tank();
TripleShot.prototype.constructor = TripleShot;


function QuadTank(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],-Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI)
  ];
  this.tankType = "QuadTank";
}
QuadTank.prototype = new Tank();
QuadTank.prototype.constructor = QuadTank;


function OctoTank(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],-Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI / 4),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],-Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],-Math.PI / 4)
  ];
  this.tankType = "OctoTank";
}
OctoTank.prototype = new Tank();
OctoTank.prototype.constructor = OctoTank;


function Sniper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,2.2],[-0.4,2.2],[-0.4, 0]],0)
  ];
  this.tankType = "Sniper";
}
Sniper.prototype = new Tank();
Sniper.prototype.constructor = Sniper;


function MachineGun(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.8,1.88],[-0.8,1.88],[-0.4, 0]],0)
  ];
  this.tankType = "MachineGun";
}
MachineGun.prototype = new Tank();
MachineGun.prototype.constructor = MachineGun;


function FlankGuard(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI)
  ];
  this.tankType = "FlankGuard";
}
FlankGuard.prototype = new Tank();
FlankGuard.prototype.constructor = FlankGuard;


function TriAngle(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI / 6 * 5),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],-Math.PI / 6 * 5)
  ];
  this.tankType = "TriAngle";
}
TriAngle.prototype = new Tank();
TriAngle.prototype.constructor = TriAngle;


function Destroyer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.7,0],[0.7,1.88],[-0.7,1.88],[-0.7, 0]],0)
  ];
  this.tankType = "Destroyer";
}
Destroyer.prototype = new Tank();
Destroyer.prototype.constructor = Destroyer;


function Overseer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],Math.PI/2),
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],-Math.PI/2)
  ];
  this.tankType = "Overseer";
}
Overseer.prototype = new Tank();
Overseer.prototype.constructor = Overseer;


function Overload(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],0),
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],Math.PI),
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],Math.PI/2),
    new Gun([[0.43,0],[0.73,1.42],[-0.73,1.42],[-0.43,0]],-Math.PI/2)
  ];
  this.tankType = "Overload";
}
Overload.prototype = new Tank();
Overload.prototype.constructor = Overload;


function TwinFlank(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],0),
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],Math.PI),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],Math.PI)
  ];
  this.tankType = "TwinFlank";
}
TwinFlank.prototype = new Tank();
TwinFlank.prototype.constructor = TwinFlank;


function PentaShot(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,1.6],[-0.42,1.6],[-0.42, 0]],Math.PI/4),
    new Gun([[0,0],[0.42,0],[0.42,1.6],[-0.42,1.6],[-0.42, 0]],-Math.PI/4),
    new Gun([[0,0],[0.42,0],[0.42,1.9],[-0.42,1.9],[-0.42, 0]],Math.PI/8),
    new Gun([[0,0],[0.42,0],[0.42,1.9],[-0.42,1.9],[-0.42, 0]],-Math.PI/8),
    new Gun([[0,0],[0.42,0],[0.42,2.25],[-0.42,2.25],[-0.42, 0]],0)
  ];
  this.tankType = "PentaShot";
}
PentaShot.prototype = new Tank();
PentaShot.prototype.constructor = PentaShot;


function Assasin(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,2.45],[-0.42,2.45],[-0.42, 0]],0)
  ];
  this.tankType = "Assasin";
}
Assasin.prototype = new Tank();
Assasin.prototype.constructor = Assasin;


function ArenaCloser(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,1.5],[-0.42,1.5],[-0.42, 0]],0)
  ];
  this.tankType = "ArenaCloser";
}
ArenaCloser.prototype = new Tank();
ArenaCloser.prototype.constructor = ArenaCloser;


function Necromanser(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[];
  this.tankType = "Necromanser";
}
Necromanser.prototype = new Tank();
Necromanser.prototype.constructor = Necromanser;


function TripleTwin(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],0),
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],Math.PI/3*2),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],Math.PI/3*2),
    new Gun([[0,0],[0.9,0],[0.9,1.88],[0.1,1.88],[0.1, 0]],-Math.PI/3*2),
    new Gun([[0,0],[-0.1,0],[-0.1,1.88],[-0.9,1.88],[-0.9, 0]],-Math.PI/3*2)
  ];
  this.tankType = "TripleTwin";
}
TripleTwin.prototype = new Tank();
TripleTwin.prototype.constructor = TripleTwin;


function Hunter(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.38,0],[0.38,2.23],[-0.38,2.23],[-0.54, 0]],0),
    new Gun([[0,0],[0.54,0],[0.54,1.91],[-0.54,1.91],[-0.54, 0]],0)
  ];
  this.tankType = "Hunter";
}
Hunter.prototype = new Tank();
Hunter.prototype.constructor = Hunter;


function Gunner(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.87,0],[0.87,1.3],[0.47,1.3],[0.47, 0]],0),
    new Gun([[0,0],[-0.87,0],[-0.87,1.3],[-0.47,1.3],[-0.47, 0]],0),
    new Gun([[0,0],[0.55,0],[0.55,1.73],[0.15,1.73],[0.15, 0]],0),
    new Gun([[0,0],[-0.55,0],[-0.55,1.73],[-0.15,1.73],[-0.15, 0]],0)
  ];
  this.tankType = "Gunner";
}
Gunner.prototype = new Tank();
Gunner.prototype.constructor = Gunner;


function Stalker(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Stalker";
}
Stalker.prototype = new Tank();
Stalker.prototype.constructor = Stalker;


function Ranger(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,2.47],[-0.42,2.47],[-0.42, 0]],0),
    new Gun([[0.8,0],[0.4,1.3],[-0.4,1.3],[-0.8,0]],0)
  ];
  this.tankType = "Ranger";
}
Ranger.prototype = new Tank();
Ranger.prototype.constructor = Ranger;


function Booster(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.45],[-0.4,1.45],[-0.4, 0]],Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.45],[-0.4,1.45],[-0.4, 0]],-Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],Math.PI / 6 * 5),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],-Math.PI / 6 * 5)
  ];
  this.tankType = "Booster";
}
Booster.prototype = new Tank();
Booster.prototype.constructor = Booster;


function Fighter(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.88],[-0.4,1.88],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],Math.PI / 6 * 5),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],-Math.PI / 6 * 5),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.65],[-0.4,1.65],[-0.4, 0]],-Math.PI / 2)
  ];
  this.tankType = "Fighter";
}
Fighter.prototype = new Tank();
Fighter.prototype.constructor = Fighter;


function Hybrid(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Hybrid";
}
Hybrid.prototype = new Tank();
Hybrid.prototype.constructor = Hybrid;


function Manager(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Manager";
}
Manager.prototype = new Tank();
Manager.prototype.constructor = Manager;


function MotherShip(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "MotherShip";
}
MotherShip.prototype = new Tank();
MotherShip.prototype.constructor = MotherShip;


function Predator(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Predator";
}
Predator.prototype = new Tank();
Predator.prototype.constructor = Predator;


function Sprayer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.38,0],[0.38,2.25],[-0.38,2.25],[-0.38, 0]],0),
    new Gun([[0,0],[0.4,0],[0.8,1.88],[-0.8,1.88],[-0.4, 0]],0)
  ];
  this.tankType = "Sprayer";
}
Sprayer.prototype = new Tank();
Sprayer.prototype.constructor = Sprayer;


function Trapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0.43,1.2],[0.73,1.6],[-0.73,1.6],[-0.43,1.2]],0),
    new Gun([[0.43,0],[0.43,1.2],[-0.43,1.2],[-0.43,0]],0)
  ];
  this.tankType = "Trapper";
}
Trapper.prototype = new Tank();
Trapper.prototype.constructor = Trapper;


function GunnerTrapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "GunnerTrapper";
}
GunnerTrapper.prototype = new Tank();
GunnerTrapper.prototype.constructor = GunnerTrapper;


function OverTrapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "OverTrapper";
}
OverTrapper.prototype = new Tank();
OverTrapper.prototype.constructor = OverTrapper;


function MegaTrapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "MegaTrapper";
}
MegaTrapper.prototype = new Tank();
MegaTrapper.prototype.constructor = MegaTrapper;


function TriTrapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "TriTrapper";
}
TriTrapper.prototype = new Tank();
TriTrapper.prototype.constructor = TriTrapper;


function Smasher(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Smasher";
}
Smasher.prototype = new Tank();
Smasher.prototype.constructor = Smasher;


function Landmine(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Landmine";
}
Landmine.prototype = new Tank();
Landmine.prototype.constructor = Landmine;


function AutoGunner(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "AutoGunner";
}
AutoGunner.prototype = new Tank();
AutoGunner.prototype.constructor = AutoGunner;


function Auto5(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Auto5";
}
Auto5.prototype = new Tank();
Auto5.prototype.constructor = Auto5;


function Auto3(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Auto3";
}
Auto3.prototype = new Tank();
Auto3.prototype.constructor = Auto3;


function SpreadShot(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.29,0],[0.29,1.32],[-0.29,1.32],[-0.29, 0]],Math.PI/12*5),
    new Gun([[0,0],[0.29,0],[0.29,1.32],[-0.29,1.32],[-0.29, 0]],-Math.PI/12*5),
    new Gun([[0,0],[0.29,0],[0.29,1.44],[-0.29,1.44],[-0.29, 0]],Math.PI/12*4),
    new Gun([[0,0],[0.29,0],[0.29,1.44],[-0.29,1.44],[-0.29, 0]],-Math.PI/12*4),
    new Gun([[0,0],[0.29,0],[0.29,1.56],[-0.29,1.56],[-0.29, 0]],Math.PI/12*3),
    new Gun([[0,0],[0.29,0],[0.29,1.56],[-0.29,1.56],[-0.29, 0]],-Math.PI/12*3),
    new Gun([[0,0],[0.29,0],[0.29,1.68],[-0.29,1.68],[-0.29, 0]],Math.PI/12*2),
    new Gun([[0,0],[0.29,0],[0.29,1.68],[-0.29,1.68],[-0.29, 0]],-Math.PI/12*2),
    new Gun([[0,0],[0.29,0],[0.29,1.8],[-0.29,1.8],[-0.29, 0]],Math.PI/12),
    new Gun([[0,0],[0.29,0],[0.29,1.8],[-0.29,1.8],[-0.29, 0]],-Math.PI/12),
    new Gun([[0,0],[0.42,0],[0.42,1.88],[-0.42,1.88],[-0.42, 0]],0)
  ];
  this.tankType = "SpreadShot";
}
SpreadShot.prototype = new Tank();
SpreadShot.prototype.constructor = SpreadShot;


function Streamliner(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.42,0],[0.42,2.25],[-0.42,2.25],[-0.42, 0]],0),
    new Gun([[0,0],[0.42,0],[0.42,2.04],[-0.42,2.04],[-0.42, 0]],0),
    new Gun([[0,0],[0.42,0],[0.42,1.83],[-0.42,1.83],[-0.42, 0]],0),
    new Gun([[0,0],[0.42,0],[0.42,1.62],[-0.42,1.62],[-0.42, 0]],0),
    new Gun([[0,0],[0.42,0],[0.42,1.41],[-0.42,1.41],[-0.42, 0]],0)
  ];
  this.tankType = "Streamliner";
}
Streamliner.prototype = new Tank();
Streamliner.prototype.constructor = Streamliner;


function AutoTrapper(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "AutoTrapper";
}
AutoTrapper.prototype = new Tank();
AutoTrapper.prototype.constructor = AutoTrapper;


function BasicDominator(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "BasicDominator";
}
BasicDominator.prototype = new Tank();
BasicDominator.prototype.constructor = BasicDominator;


function GunnerDominator(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "GunnerDominator";
}
GunnerDominator.prototype = new Tank();
GunnerDominator.prototype.constructor = GunnerDominator;


function TrapperDominator(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "TrapperDominator";
}
TrapperDominator.prototype = new Tank();
TrapperDominator.prototype.constructor = TrapperDominator;


function BattleShip(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "BattleShip";
}
BattleShip.prototype = new Tank();
BattleShip.prototype.constructor = BattleShip;


function Annihilator(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.95,0],[0.95,1.88],[-0.95,1.88],[-0.95, 0]],0)
  ];
  this.tankType = "Annihilator";
}
Annihilator.prototype = new Tank();
Annihilator.prototype.constructor = Annihilator;


function AutoSmasher(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "AutoSmasher";
}
AutoSmasher.prototype = new Tank();
AutoSmasher.prototype.constructor = AutoSmasher;


function Spike(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Spike";
}
Spike.prototype = new Tank();
Spike.prototype.constructor = Spike;


function Factory(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Factory";
}
Factory.prototype = new Tank();
Factory.prototype.constructor = Factory;


function Skimmer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Skimmer";
}
Skimmer.prototype = new Tank();
Skimmer.prototype.constructor = Skimmer;


function Rocketeer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[

  ];
  this.tankType = "Rocketeer";
}
Rocketeer.prototype = new Tank();
Rocketeer.prototype.constructor = Rocketeer;
