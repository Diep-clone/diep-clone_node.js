function BasicBullet(tank,sx,sy){
  DynamicObject.apply(this, arguments);
  this.color = new RGB(0,176,225);
  this.owner = tank;
  this.speedX = sx;
  this.speedY = sy;
  this.time = 3000;
  this.isDead = false;
  this.canvas = document.createElement("canvas");
  this.ctx = canvas.getContext("2d");
  this.canvasPos = {x:0,y:0};
  this.animate = function(){
    if (this.isDead || this.health<0 || this.time<0){
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
    this.time-=tick;
    this.move();
    this.draw();
  }
  this.move = function(){
    this.addForce(this.speedX,this.speedY);
  }
  this.setCanvasSize = function(){
    this.canvas.width = (this.radius * 2) * camera.z;
    this.canvas.height = (this.radius * 2) * camera.z;
    this.canvasPos = {x:this.radius * camera.z,y:this.radius * camera.z};
    this.canvas.width += 4 * camera.z + 6;
    this.canvas.height += 4 * camera.z + 6;
    this.canvasPos.x += 2 * camera.z + 3;
    this.canvasPos.y += 2 * camera.z + 3;
    this.ctx.lineWidth = 2 * camera.z;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }
  this.draw = function(){
    this.setCanvasSize();

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
BasicBullet.prototype = new DynamicObject();
BasicBullet.prototype.constructor = BasicBullet;

