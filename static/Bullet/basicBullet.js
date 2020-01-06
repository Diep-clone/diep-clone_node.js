function BasicBullet(){
  "use strict";

  DynamicObject.apply(this, arguments);
  this.color = new RGB(0,176,225);
  this.owner;
  this.isDead = false;
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.canvasSize = {x:0,y:0};
  this.canvasPos = {x:0,y:0};
  this.animate = function(tick){
    if (this.isDead || this.health<0 || this.time<0){
      if (this.opacity == 0){
        system.removeObject(this.id,'bullet');
        return;
      }
      else if (this.opacity > 0){
        this.opacity = Math.max(this.opacity - 0.1 * tick * 0.05, 0);
        this.radius += 0.3 * tick * 0.05;
      }
    }
  }
  this.setColor = function (color){
    this.color = color;
  }
  this.dead = function(){
    this.isDead = true;
  }
  this.setCanvasSize = function(camera){
    this.canvasSize.x = ((this.radius * 2) * camera.z);
    this.canvasSize.y = ((this.radius * 2) * camera.z);
    this.canvasPos = {x:(this.radius * camera.z),y:(this.radius * camera.z)};
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

    this.ctx.strokeStyle = this.color.getDarkRGB().getRGBValue(); // 몸체 그리기
    this.ctx.fillStyle = this.color.getRGBValue();
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(this.canvasPos.x),Math.floor(this.canvasPos.y),this.radius * camera.z,0,Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.canvas,(this.x - camera.x) * camera.z-Math.floor(this.canvasPos.x),(this.y - camera.y) * camera.z-Math.floor(this.canvasPos.y));
  }
}
BasicBullet.prototype = new DynamicObject();
BasicBullet.prototype.constructor = BasicBullet;
