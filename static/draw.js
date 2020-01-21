function DrawObject(camera){ // 그리기 담당
  "use strict";

  this.canvas = document.getElementById("canvas");
  this.ctx = canvas.getContext("2d", {alpha:false});

  this.objCanvas = document.createElement("canvas");
  this.objCtx = this.objCanvas.getContext("2d");

  this.dCanvas = document.createElement("canvas");
  this.dCtx = this.dCanvas.getContext("2d");

  this.uiCanvas = document.createElement("canvas");
  this.uiCtx = this.uiCanvas.getContext("2d");

  this.backgroundColor = new RGB(205,205,205);

  this.mapSize = {x:0,y:0};

  this.sight = 1;
  this.showSight = 2.3;

  socket.on('mapSize',(data) => {
    this.mapSize = data;
  });

  this.camera = {
    x:0,
    y:0,
    z:1,
    uiz:1
  };

  this.getCanvasSize = function (){
    return [this.canvas.width,this.canvas.height,this.camera.uiz];
  }

  this.getCameraSet = function (){
    return this.camera;
  }

  this.setSight = function(sight){
    this.sight = sight;
  }

  this.resize = function (){
    this.canvas.width=this.objCanvas.width=this.dCanvas.width=this.uiCanvas.width=window.innerWidth * window.devicePixelRatio;
    this.canvas.height=this.objCanvas.height=this.dCanvas.height=this.uiCanvas.height=window.innerHeight * window.devicePixelRatio;
    this.dCtx.lineCap = this.uiCtx.lineCap = "round";
    this.dCtx.lineJoin = this.uiCtx.lineJoin = "round";
    this.ctx.imageSmoothingEnabled = false;
    this.objCtx.imageSmoothingEnabled = false;
    this.dCtx.imageSmoothingEnabled = false;
    this.uiCtx.imageSmoothingEnabled = false;
    socket.emit('windowResized',{screenWidth:this.canvas.width,screenHeight:this.canvas.height});
  }

  this.setCursor = function (style){
    this.canvas.style.cursor = style;
  }

  this.im = {x:0,y:0};

  this.cameraSet = function (tank){
    if (this.canvas.width<this.canvas.height/9*16) this.camera.z=this.canvas.height/900; // 화면 크기에 따른 줌값 조정
    else this.camera.z=this.canvas.width/1600;

    this.camera.uiz = this.camera.z; // *1.78 은 1레벨 탱크의 시야 *1.43 은 45레벨 탱크의 시야 *1.229 는 75레벨 탱크의 시야

    this.camera.z *= this.showSight;
    this.showSight -= (this.showSight - this.sight) / 20;

    if (tank){
      //this.camera.x-= (this.camera.x - (tank.x-this.canvas.width/2/this.camera.z)) / 20;
      //this.camera.y-= (this.camera.y - (tank.y-this.canvas.height/2/this.camera.z)) / 20;
      this.camera.x = (tank.x-this.canvas.width/2/this.camera.z);
      this.camera.y = (tank.y-this.canvas.height/2/this.camera.z);
    }
  }

  this.backgroundDraw = function (){
    this.objCtx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.dCtx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.uiCtx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.ctx.globalAlpha = 1;


    this.ctx.fillStyle = this.backgroundColor.getDarkRGB(0.1).getRGBValue();
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    this.ctx.fillStyle = this.backgroundColor.getRGBValue();
    this.ctx.fillRect((-this.mapSize.x-this.camera.x)*this.camera.z,(-this.mapSize.y-this.camera.y)*this.camera.z,this.mapSize.x*2*this.camera.z,this.mapSize.y*2*this.camera.z);


    this.ctx.beginPath(); // 격자 그리기
    for (let i=-this.camera.x % 12.9 * this.camera.z;i<=this.canvas.width;i+=12.9 * this.camera.z){
        this.ctx.moveTo(i,0);
        this.ctx.lineTo(i,this.canvas.height);
    }
    for (let i=-this.camera.y % 12.9 * this.camera.z;i<=this.canvas.height;i+=12.9 * this.camera.z){
        this.ctx.moveTo(0,i);
        this.ctx.lineTo(this.canvas.width,i);
    }
    this.ctx.strokeStyle = "black";
    this.ctx.globalAlpha = 0.1;
    this.ctx.lineWidth = 0.4;
    this.ctx.stroke();
  }

  this.objectDraw = function (obj){
    for (let key in obj){
      if (obj[key]){
        obj[key].draw(this.ctx,this.camera);
      }
    }
  }

  this.objectStatusDraw = function (obj){
    for (let key in obj){
      if (obj[key] && obj[key].drawName && obj[key].id !== system.controlTank.id){
        obj[key].drawName(this.dCtx,this.camera);
      }
    }
    for (let key in obj){
      if (obj[key] && obj[key].drawHPBar){
        obj[key].drawHPBar(this.dCtx,this.camera);
      }
    }
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(this.dCanvas,0,0);
  }

  this.uiDraw = function (ui){
    for (let i=0;i<ui.length;i++){
      ui[i].draw(this.uiCtx,this.camera.uiz);
    }

    this.ctx.globalAlpha = 0.82;
    this.ctx.drawImage(this.uiCanvas,0,0);
  }

  window.onload=this.resize.bind(this);
  window.onresize=this.resize.bind(this);

  window.onbeforeunload=function(){
    return "정말 나가실 건가요?";
  }
}

function RGB(r,g,b){
  this.r= r;
  this.g= g;
  this.b= b;
  this.setRGB = function(r,g,b){
    this.r=r;
    this.g=g;
    this.b=b;
  }
  this.getRGBValue = function(){
    return "rgb(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + ")";
  }
  this.getDarkRGB = function(per){
    if (per==null) per=0.25;
    let r = (0 - this.r) * per + this.r;
    let g = (0 - this.g) * per + this.g;
    let b = (0 - this.b) * per + this.b;
    return new RGB(r,g,b);
  }
  this.getLightRGB = function(per){
    let r = (255 - this.r) * per + this.r;
    let g = (255 - this.g) * per + this.g;
    let b = (255 - this.b) * per + this.b;
    return new RGB(r,g,b);
  }
  this.getRedRGB = function(per){
    let r = (255 - this.r) * per + this.r;
    let g = (0 - this.g) * per + this.g;
    let b = (0 - this.b) * per + this.b;
    return new RGB(r,g,b);
  }
}

function Button(text){
  "use strict";

  this.x1;
  this.y1;
  this.x2;
  this.y2;

  this.text = new Text(text,10);

  this.color = new RGB(127,127,127);

  this.setPosition = function (x1,y1,x2,y2){
    this.x1= x1;
    this.y1= y1;
    this.x2= x2;
    this.y2= y2;
  }

  this.setColor = function (color){
    this.color = color;
  }

  this.inMousePoint = function (x,y){
    if (this.x1<x && this.x2>x && this.y1<y && this.y2>y){
      return true;
    }
    else return false;
  }

  this.draw = function (ctx,z){
    ctx.fillStyle = this.color.getRGBValue();
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 8 * z;
    ctx.strokeRect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);

    ctx.fillRect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
    ctx.fillStyle = this.color.getDarkRGB().getRGBValue();
    ctx.fillRect(this.x1,(this.y1+this.y2)/2+6.5 * z,this.x2-this.x1,(this.y2-this.y1)/2-6.5 * z);
  }
}

function Bar(){
  "use strict";

  this.x1;
  this.x2;
  this.y;
  this.percent;
  this.radius;

  this.color = new RGB(0,0,0);

  this.setPosition = function (x1,x2,y,p){
    this.x1 = x1;
    this.x2 = x2;
    this.y = y;
    this.percent = p;
  }

  this.setRadius = function (r){
    this.radius = r;
  }

  this.inMousePoint = function (x,y){
    return false;
  }

  this.draw = function (ctx,z){
    ctx.beginPath();
    ctx.fillStyle = this.color.getRGBValue();
    ctx.strokeStyle = "#000000";

    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

function Text(text,size){
  "use strict";

  this.text = text;
  this.size = size;
  this.x;
  this.y;
  this.align = "center";
  this.rotate;

  this.inMousePoint = function (x,y){
    return false;
  }

  this.setPosition = function (x,y,rotate){
    this.x = x;
    this.y = y;
    this.rotate = rotate;
  }

  this.setText = function (text){
    this.text = text;
  }

  this.setSize = function (size){
    this.size = size;
  }

  this.draw = function (ctx,z){
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5 * z;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotate);
    ctx.textAlign = this.align;
    ctx.font = "bold " + this.size * z + "px Ubuntu";

    ctx.strokeText(this.text,0,0);
    ctx.fillText(this.text,0,0);
    ctx.restore();
  }
}
