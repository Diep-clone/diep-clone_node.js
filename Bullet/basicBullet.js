function BasicBullet(tank,sx,sy){
  this.color = new RGB(0,176,225);
  this.owner = tank;
  this.speedX = sx;
  this.speedY = sy;
  this.time = 3000;
  this.canvas = document.createElement("canvas");
  this.ctx = canvas.getContext("2d");
  this.animate = function(){
    this.move();
  }
  this.move = function(){
    this.addForce(this.speedX,this.speedY);
  }
  this.draw = function(){
    
  }
}
BasicBullet.prototype = new DynamicObject();
BasicBullet.prototype.constructor = BasicBullet;

