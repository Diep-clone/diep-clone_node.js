function BasicBullet(tank,sx,sy){
  this.color = new RGB(0,176,225);
  this.owner = tank;
  this.rotate = 0;
  this.speedX = sx;
  this.speedY = sy;
  this.time = 3000;
}
BasicBullet.prototype = new DynamicObject();
BasicBullet.prototype.constructor = BasicBullet;
