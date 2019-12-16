function Tank(){
  this.stats = [0,0,0,0,0,0,0,0];
  this.maxStats = [7,7,7,7,7,7,7,7];
  this.statCount = 0;
  this.tankType = null;
  this.guns = [];
  this.color = new RGB(0,176,225);
  this.gunColor = new RGB(153,153,153);
  this.lv = 1;
  this.score = 0;
  this.click = false;
  this.rclick = false;
  this.autoC = false;
  this.autoE = false;
  this.isDead = false;
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvasPos = {x:0,y:0};
  this.animate = function(){
    if (this.isDead){
      if (this.opacity <= 0.1){
        this.opacity = 0;
        object_list[this.id] = null;
        return;
      }
      else{
        this.opacity -= 0.1;
        this.radius += 0.3;
      }
    }
    this.rotate += 0.01;
    this.draw();
  }
  this.levelUP = function(){

  }
  this.setRotate = function(){

  }
  this.setMovement = function(){

  }
  this.setAutoC = function(){

  }
  this.setAutoE = function(){

  }
  this.setClick = function(){

  }
  this.setStat = function(){

  }
  this.addGun = function(g){
    this.guns.push(g);
  }
  this.clearGun = function(){
    this.guns = [];
  }
  this.keydown = function(){

  }
  this.setCanvasSize = function(){
    this.canvas.width = (this.radius * 2) * camera.z;
    this.canvas.height = (this.radius * 2) * camera.z;
    this.canvasPos = {x:this.radius * camera.z,y:this.radius * camera.z};
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].setParentCanvasSize();
    }
    this.canvas.width += 4 * camera.z + 6;
    this.canvas.height += 4 * camera.z + 6;
    this.canvasPos.x += 2 * camera.z + 2;
    this.canvasPos.y += 2 * camera.z + 2;
    this.ctx.lineWidth = 2 * camera.z;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }
  this.draw = function(){
    this.setCanvasSize();

    this.ctx.strokeStyle = this.gunColor.getDarkRGB(); // 총구 그리기
    this.ctx.fillStyle = this.gunColor.getRGB();
    for (let i=0;i<this.guns.length;i++){
      this.guns[i].drawGun();
    }

    this.ctx.strokeStyle = this.color.getDarkRGB(); // 몸체 그리기
    this.ctx.fillStyle = this.color.getRGB();
    this.ctx.beginPath();
    this.ctx.arc(this.canvasPos.x,this.canvasPos.y,this.radius * camera.z,0,Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#777777";
    this.ctx.beginPath();
    this.ctx.moveTo(0,0);
    this.ctx.lineTo(this.canvas.width,this.canvas.height);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(0,this.canvas.height);
    this.ctx.lineTo(this.canvas.width,0);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.strokeRect(0,0,this.canvas.width,this.canvas.height);

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.canvas,this.x * camera.z-this.canvasPos.x,this.y * camera.z-this.canvasPos.y);
  }
}
Tank.prototype = new HealthShowObject();
Tank.prototype.constructor = Tank;


function Basic(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.tankType = "Basic";
}
Basic.prototype = new Tank();
Basic.prototype.constructor = Basic;


function Twin(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.9,0],[0.9,1.9],[0.1,1.9],[0.1, 0]],0));
  this.addGun(new Gun(this,[[0,0],[-0.1,0],[-0.1,1.9],[-0.9,1.9],[-0.9, 0]],0));
  this.tankType = "Twin";
}
Twin.prototype = new Tank();
Twin.prototype.constructor = Twin;


function Triplet(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.9,0],[0.9,1.6],[0.1,1.6],[0.1, 0]],0));
  this.addGun(new Gun(this,[[0,0],[-0.1,0],[-0.1,1.6],[-0.9,1.6],[-0.9, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.tankType = "Triplet";
}
Triplet.prototype = new Tank();
Triplet.prototype.constructor = Triplet;


function TripleShot(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4));
  this.tankType = "TripleShot";
}
TripleShot.prototype = new Tank();
TripleShot.prototype.constructor = TripleShot;


function QuadTank(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 2));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 2));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI));
  this.tankType = "QuadTank";
}
QuadTank.prototype = new Tank();
QuadTank.prototype.constructor = QuadTank;


function OctoTank(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 2));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 2));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4 * 3));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],Math.PI / 4 * 3));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],-Math.PI / 4));
  this.tankType = "OctoTank";
}
OctoTank.prototype = new Tank();
OctoTank.prototype.constructor = OctoTank;


function Sniper(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,2.2],[-0.4,2.2],[-0.4, 0]],0));
  this.tankType = "Sniper";
}
Sniper.prototype = new Tank();
Sniper.prototype.constructor = Sniper;


function MachineGun(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.8,1.9],[-0.8,1.9],[-0.4, 0]],0));
  this.tankType = "MachineGun";
}
MachineGun.prototype = new Tank();
MachineGun.prototype.constructor = MachineGun;


function FlankGuard(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI));
  this.tankType = "FlankGuard";
}
FlankGuard.prototype = new Tank();
FlankGuard.prototype.constructor = FlankGuard;


function TriAngle(){
  this.clearGun();
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.9],[-0.4,1.9],[-0.4, 0]],0));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],Math.PI / 8 * 7));
  this.addGun(new Gun(this,[[0,0],[0.4,0],[0.4,1.6],[-0.4,1.6],[-0.4, 0]],-Math.PI / 8 * 7));
  this.tankType = "TriAngle";
}
TriAngle.prototype = new Tank();
TriAngle.prototype.constructor = TriAngle;


var tanklist = [
  Basic,
  Twin,
  Triplet,
  TripleShot,
  QuadTank,
  OctoTank,
  Sniper,
  MachineGun,
  FlankGuard,
  TriAngle
];
