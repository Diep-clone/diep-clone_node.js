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
      if (this.opacity == 0){
        system.removeObject(this.id,'tank');
        return;
      }
      else if (this.opacity > 0){
        this.opacity = Math.max(this.opacity - 0.1 * tick * 0.05, 0);
        this.radius += 0.3 * tick * 0.05;
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
    console.log(this.id);
    this.hitTime=0.4;
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
    //this.ctx.arc(this.canvasPos.x,this.canvasPos.y,this.radius * camera.z,0,Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.canvas,(this.x - this.dx - camera.x) * camera.z-Math.floor(this.canvasPos.x),(this.y - this.dy - camera.y) * camera.z-Math.floor(this.canvasPos.y));
    //ctx.drawImage(this.canvas,((this.x + this.dx - camera.x) * camera.z-this.canvasPos.x),((this.y + this.dy - camera.y) * camera.z-this.canvasPos.y));
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
    new Gun([[0,0],[0.9,0],[0.9,1.9],[0.1,1.9],[0.1, 0]],0),
    new Gun([[0,0],[-0.1,0],[-0.1,1.9],[-0.9,1.9],[-0.9, 0]],0)
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
    new Gun([[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0)
  ];
  this.tankType = "Triplet";
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
    new Gun([[0,0],[0.4,0],[0.8,1.9],[-0.8,1.9],[-0.4, 0]],0)
  ];
  this.tankType = "MachineGun";
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
}
Destroyer.prototype = new Tank();
Destroyer.prototype.constructor = Destroyer;
