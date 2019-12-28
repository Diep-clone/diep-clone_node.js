function HealthShowObject(){
  "use strict";
  DynamicObject.apply(this, arguments);

  this.drawHPBar = function(){

  }
}
HealthShowObject.prototype = new DynamicObject();
HealthShowObject.prototype.constructor = HealthShowObject;
