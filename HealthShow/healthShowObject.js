function HealthShowObject(){
  "use strict";

  DynamicObject.apply(this, arguments);
  this.getDamageTime;
  this.naturelHeal = function(){

  }
  this.drawHPBar = function(){

  }
}
HealthShowObject.prototype = new DynamicObject();
HealthShowObject.prototype.constructor = HealthShowObject;
