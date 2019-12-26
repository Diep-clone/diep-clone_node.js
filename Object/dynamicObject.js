function DynamicObject(){
  "use strict";

  this.x=0;
  this.y=0;
  this.radius = 13.0;
  this.rotate=0;
  this.maxHealth=10;
  this.health=10;
  this.opacity=1;
  this.id;
}


function Shape(){
  "use strict";

  this.addRotate;
  this.moveRotate;

  this.animate = function(){
    this.rotate += this.addRotate;
    this.addForce(this.moveRotate);
  }
}
