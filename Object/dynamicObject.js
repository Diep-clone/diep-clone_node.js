function DynamicObject(){
  "use strict";

  this.x=0;
  this.y=0;
  this.radius = 13.0;
  this.dx=0;
  this.dy=0;
  this.rotate=0;
  this.maxHealth=10;
  this.health=10;
  this.damage=8;
  this.opacity=1;
  this.id;
  this.addForce = function(x,y){
    this.dx+=x;
    this.dy+=y;
  }
  this.deceleration = function (){
    this.dx*=0.9;
    this.dy*=0.9;
  }
  this.animatePosition = function (){
    this.x+=this.dx;
    this.y+=this.dy;
  }
}

function Shape(){
  "use strict";
  
  HealthShowObject.apply(this, arguments);
  
  this.addRotate;
  this.moveRotate;
  
  this.animate = function (){
    this.addForce(Math.sin(this.moveRotate) * 1,Math.cos(this.moveRotate) * 1);
    this.rotate += this.addRotate;
    this.addForce();
    this.deceleration();
    this.animatePosition();
  }
}
Shape.prototype = new HealthShowObject();
Shape.prototype.constructor = Shape;


function Rectangle(){
  "use strict";
  
  Shape.apply(this, arguments);
  
  this.addRotate = 1;
  this.moveRotate = 1;
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.canvasPos = {x:0,y:0};
  this.color = new RGB(255,255,255);
  
  this.setCanvasSize = function(){
    this.ctx.width = 20 + 6 * camera.z;
    this.ctx.height = 20 + 6 * camera.z;
  }
  
  this.draw = function (){
    this.setCanvasSize();
    this.ctx.fillStyle = this.color.getRGBValue();
    this.ctx.strokeStyle = this.color.getDarkRGB().getRGBValue();
    this.ctx.beginPath();
    this.ctx.moveTo(this.x+Math.sin(this.rotate) * 10,this.y+Math.cos(this.rotate) * 10);
    this.ctx.lineTo(this.x+Math.sin(this.rotate + Math.PI / 2) * 10,this.y+Math.cos(this.rotate + Math.PI / 2) * 10);
    this.ctx.lineTo(this.x+Math.sin(this.rotate + Math.PI) * 10,this.y+Math.cos(this.rotate + Math.PI) * 10);
    this.ctx.lineTo(this.x+Math.sin(this.rotate - Math.PI / 2) * 10,this.y+Math.cos(this.rotate - Math.PI / 2) * 10);
    this.ctx.lineTo(this.x+Math.sin(this.rotate) * 10,this.y+Math.cos(this.rotate) * 10);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    
    
  }
}
Rectangle.prototype = new Shape();
Rectangle.prototype.constructor = Rectangle;
