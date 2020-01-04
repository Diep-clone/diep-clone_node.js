function HealthShowObject(){
  "use strict";
  DynamicObject.apply(this, arguments);

  this.drawHPBar = function(ctx,camera){
    let healthPercent = this.health/this.maxHealth;

    ctx.globalAlpha = this.opacity;

    if (healthPercent<1){
      console.log(healthPercent);
      ctx.beginPath();
      ctx.moveTo((this.x - this.dx - camera.x + this.radius) * camera.z,(this.y - this.dy - camera.y + this.radius * 5 / 3) * camera.z);
      ctx.lineTo((this.x - this.dx - camera.x - this.radius) * camera.z,(this.y - this.dy - camera.y + this.radius * 5 / 3) * camera.z);
      ctx.closePath();
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 4.1 * camera.z;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo((this.x - this.dx - camera.x - this.radius) * camera.z,(this.y - this.dy - camera.y + this.radius * 5 / 3) * camera.z);
      ctx.lineTo((this.x - this.dx - camera.x - this.radius + healthPercent * this.radius * 2) * camera.z,(this.y - this.dy - camera.y + this.radius * 5 / 3) * camera.z);
      ctx.closePath();
      ctx.strokeStyle = "#86e27f";
      ctx.lineWidth = 2.6 * camera.z;
      ctx.stroke();
    }
  }
}
HealthShowObject.prototype = new DynamicObject();
HealthShowObject.prototype.constructor = HealthShowObject;
