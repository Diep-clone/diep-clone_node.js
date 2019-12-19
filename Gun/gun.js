function Gun(tank,paths,dir,custom,type,pos,radius,speed,damage,health,reload,spread,shottime,force){
  SubObject.apply(this, arguments);
  this.parentObject = tank;
  this.point = paths;
  this.addRotate = dir;
  this.bullet = {
    type: type, // 총탄 타입
    pos: pos, // 발사 위치
    radius: radius, // 총탄 크기 %
    speed: speed, // 총탄 속도 %
    damage: damage, // 총탄 데미지 %
    health: health, // 총탄 체력 %
    reload: reload, // 총탄 리로드
    spread: spread, // 탄퍼짐
    shottime: shottime, // 총탄 발사 시점 %
    force: force // 총탄 반동 %
  };
  this.cooltime = 0;
  this.isCanShot = true;
  this.lastShotTime = 0;
  this.isCustom = custom;

  this.animate = function (e){
    if (this.isCustom){

    }
  }

  this.shot = function (){
    let x = this.bullet.pos[0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.bullet.pos[1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx;
    let y = this.bullet.pos[0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.bullet.pos[1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy;
    let obj = new this.bullet.type();

    obj.x = x;
    obj.y = y;
    obj.radius = this.bullet.radius;

  }

  this.setParentCanvasSize = function (camera){
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

  this.drawGun = function (ctx,camera){
    let rotate = this.parentObject.rotate;
    let radius = this.parentObject.radius;
    let xx = this.parentObject.canvasPos.x;
    let yy = this.parentObject.canvasPos.y;

    ctx.beginPath();
    let x = this.point[0][0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[0][1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx;
    let y = this.point[0][0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[0][1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy;
    ctx.moveTo(x,y);
    for (let i=0;i<this.point.length;i++){
      let x = this.point[i][0]*Math.cos(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.cos(rotate+this.addRotate)*camera.z*radius+xx;
      let y = this.point[i][0]*Math.sin(rotate-Math.PI/2+this.addRotate)*camera.z*radius+this.point[i][1]*Math.sin(rotate+this.addRotate)*camera.z*radius+yy;
      ctx.lineTo(x,y);
    }
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}
Gun.prototype = new SubObject();
Gun.prototype.constructor = Gun;
