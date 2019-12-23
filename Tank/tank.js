function Tank(){
  "use strict";

  HealthShowObject.apply(this, arguments);
  this.stats = [0,0,0,0,0,0,0,0];
  this.maxStats = [7,7,7,7,7,7,7,7];
  this.statCount = 0;
  this.tankType = null;
  this.upgradeTanks = [];
  this.guns = [];
  this.color = new RGB(0,176,225);
  this.gunColor = new RGB(153,153,153);
  this.name = "";
  this.lv = 1;
  this.score = 0;
  this.isDead = false;
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvasSize = {x:0,y:0};
  this.canvasPos = {x:0,y:0};
  this.hitTime = 0;
  this.r = 0;
  this.w = 0;
  this.rwswitch = 0;

  this.animate = function(e,tick){
    if (this.isDead || this.health<0){
      if (this.opacity <= 0.1){
        this.opacity = 0;
        object_list[this.id] = null;
        return;
      }
      else{
        this.opacity -= 0.1 * tick * 0.05;
        this.radius += 0.3 * tick * 0.05;
      }
    }
    if (this.hitTime>0){ // hit effect
      console.log(this.r,this.w,this.rwswitch);
      this.hitTime -= 0.1 * tick * 0.05;
      switch (this.rwswitch){
        case 0:
          this.rwswitch = 1;
        case 1:
          if (this.w>0) this.w= Math.max(this.w - 0.6 * tick * 0.05,0);
          if (this.r<0.4) this.r+= 0.6 * tick * 0.05;
          else{
            this.rwswitch = 2;
            this.w -= 0.4-this.r;
            this.r = 0.4;
          }
          break;
        case 2:
          if (this.r>0) this.r= Math.max(this.r - 0.6 * tick * 0.05,0);
          if (this.w<0.4) this.w+= 0.6 * tick * 0.05;
          else{
            this.rwswitch = 1;
            this.r -= 0.4-this.w;
            this.w = 0.4;
          }
          break;
        default:
          break;
      }
    }
    else{
      this.hitTime = 0;
      this.rwswitch = 0;
      if (this.r>0) this.r= Math.max(this.r - 0.2 * tick * 0.05,0);
      if (this.w>0) this.w= Math.max(this.w - 0.2 * tick * 0.05,0);
    }
    this.rotate += 0.02 * tick * 0.05;
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].animate(e);
    }
  }
  this.levelUP = function(){

  }
  this.changeTank = function (type){
    let t = new type();
    this.guns = t.guns;
    this.tankType = t.tankType;
    this.upgradeTanks = t.upgradeTanks;
  }
  this.setRotate = function(){

  }
  this.setMovement = function(){

  }
  this.setStat = function(){

  }
  this.hit = function(time){
    this.hitTime+=time;
  }
  this.setCanvasSize = function(camera){
    this.canvasSize.x = ((this.radius * 2) * camera.z);
    this.canvasSize.y = ((this.radius * 2) * camera.z);
    this.canvasPos = {x:(this.radius * camera.z),y:(this.radius * camera.z)};
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].setParentCanvasSize(this,camera);
    }
    this.canvas.width = this.canvasSize.x + 4 * camera.z + 6;
    this.canvas.height = this.canvasSize.y + 4 * camera.z + 6;
    this.canvasPos.x += 2 * camera.z + 3;
    this.canvasPos.y += 2 * camera.z + 3;
    this.ctx.lineWidth = 2 * camera.z;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
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
    this.ctx.arc(Math.floor(this.canvasPos.x),Math.floor(this.canvasPos.y),this.radius * camera.z,0,Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.canvas,((this.x - camera.x) * camera.z-Math.floor(this.canvasPos.x)),((this.y - camera.y) * camera.z-Math.floor(this.canvasPos.y)));
  }
}
Tank.prototype = new HealthShowObject();
Tank.prototype.constructor = Tank;


function Basic(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0)
  ];
  this.tankType = "Basic";
  this.upgradeTanks = [
    {lv:15,type:Twin},
    {lv:15,type:Sniper},
    {lv:15,type:MachineGun},
    {lv:15,type:FlankGuard}
  ];
}
Basic.prototype = new Tank();
Basic.prototype.constructor = Basic;


function Twin(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.9],[0.1,1.9],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.9],[-0.9,1.9],[-0.9, 0]],0)
  ];
  this.tankType = "Twin";
  this.upgradeTanks = [
    {lv:30,type:TripleShot},
    {lv:30,type:QuadTank}
  ]
}
Twin.prototype = new Tank();
Twin.prototype.constructor = Twin;


function Triplet(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.9,0],[0.9,1.6],[0.1,1.6],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.6],[-0.9,1.6],[-0.9, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0)
  ];
  this.tankType = "Triplet";
  this.upgradeTanks = [];
}
Triplet.prototype = new Tank();
Triplet.prototype.constructor = Triplet;


function TripleShot(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4)
  ];
  this.tankType = "TripleShot";
  this.upgradeTanks = [
    {lv:45,type:Triplet}
  ];
}
TripleShot.prototype = new Tank();
TripleShot.prototype.constructor = TripleShot;


function QuadTank(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI)
  ];
  this.tankType = "QuadTank";
  this.upgradeTanks = [
    {lv:45,type:OctoTank}
  ]
}
QuadTank.prototype = new Tank();
QuadTank.prototype.constructor = QuadTank;


function OctoTank(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 2),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4 * 3),
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4)
  ];
  this.tankType = "OctoTank";
  this.upgradeTanks = [];
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
  this.upgradeTanks = [];
}
Sniper.prototype = new Tank();
Sniper.prototype.constructor = Sniper;


function MachineGun(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.8,1.9],[-0.8,1.9],[-0.4, 0]],0)
  ];
  this.tankType = "MachineGun";
  this.upgradeTanks = [
    {lv:30,type:Destroyer}
  ];
}
MachineGun.prototype = new Tank();
MachineGun.prototype.constructor = MachineGun;


function FlankGuard(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI)
  ];
  this.tankType = "FlankGuard";
  this.upgradeTanks = [
    {lv:30,type:TriAngle}
  ];
}
FlankGuard.prototype = new Tank();
FlankGuard.prototype.constructor = FlankGuard;


function TriAngle(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI / 6 * 5),
    new Gun([[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],-Math.PI / 6 * 5)
  ];
  this.tankType = "TriAngle";
  this.upgradeTanks = [];
}
TriAngle.prototype = new Tank();
TriAngle.prototype.constructor = TriAngle;


function Destroyer(){
  "use strict";
  Tank.apply(this, arguments);
  this.guns=[
    new Gun([[0,0],[0.7,0],[0.7,1.9],[-0.7,1.9],[-0.7, 0]],0)
  ];
  this.tankType = "Destroyer";
  this.upgradeTanks = [];
}
Destroyer.prototype = new Tank();
Destroyer.prototype.constructor = Destroyer;
