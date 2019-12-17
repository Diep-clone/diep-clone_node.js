function Gun(tank,paths,dir,type,pos,radius,speed,damage,health,reload,shottime,force){
  SubObject.apply(this, arguments);
  this.parentObject = tank;
  this.point = paths;
  this.addRotate = dir;
  this.bullet = {
    type: type,
    pos: pos,
    radius: radius,
    speed: speed,
    damage: damage,
    health: health,
    reload: reload,
    shottime: shottime,
    force: force
  };
  this.cooltime = 0;
  this.isCanShot = true;
  this.lastShotTime = 0;
  
  this.shot = function (){
    
  }

  this.setParentCanvasSize = function (){
    let rotate = this.parentObject.rotate;
    let radius = this.parentObject.radius;
    let xx = this.parentObject.canvasPos.x;
    let yy = this.parentObject.canvasPos.y;

    for (let i=0;i<this.point.length;i++){
      let x = Math.round(this.point[i][0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx);
      let y = Math.round(this.point[i][0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy);

      if (x<0){
        this.parentObject.canvas.width += -x;
        this.parentObject.canvasPos.x += -x;
        xx = this.parentObject.canvasPos.x;
      }
      else if (x>this.parentObject.canvas.width){
        this.parentObject.canvas.width = x;
      }
      if (y<0){
        this.parentObject.canvas.height += -y;
        this.parentObject.canvasPos.y += -y;
        yy = this.parentObject.canvasPos.y;
      }
      else if (y>this.parentObject.canvas.height){
        this.parentObject.canvas.height = y;
      }
    }
  }

  this.drawGun = function (){
    let rotate = this.parentObject.rotate;
    let radius = this.parentObject.radius;
    let xx = this.parentObject.canvasPos.x;
    let yy = this.parentObject.canvasPos.y;

    this.parentObject.ctx.beginPath();
    let x = this.point[0][0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[0][1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx;
    let y = this.point[0][0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[0][1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy;
    this.parentObject.ctx.moveTo(x,y);
    for (let i=0;i<this.point.length;i++){
      let x = this.point[i][0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx;
      let y = this.point[i][0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy;
      this.parentObject.ctx.lineTo(x,y);
    }
    this.parentObject.ctx.fill();
    this.parentObject.ctx.stroke();
    this.parentObject.ctx.closePath();
  }
}
Gun.prototype = new SubObject();
Gun.prototype.constructor = Gun;
