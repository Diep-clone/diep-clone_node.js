
function Quadtree(x,y,w,h){
  this.pos = {x:x,y:y};
  this.siz = {w:w,h:h};
  this.level = 1;
  this.objects = [];
  this.nodes = [];
};

Quadtree.prototype.split = function (){

}

exports = Quadtree;
