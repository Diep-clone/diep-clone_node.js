
function Quadtree(x, y, w, h, level){
  this.pos = {x:x, y:y};
  this.siz = {w:w, h:h};
  this.level = level || 1;
  this.objects = [];
  this.nodes = [];
};

Quadtree.prototype.split = function (){
  var level = this.level + 1,
      w     = this.siz.w / 2,
      h     = this.siz.h / 2;

  /* index
   *  0 1
   *  2 3
   */

  this.nodes[0] = new Quadtree(this.pos.x, this.pos.y, w, h, level);
  this.nodes[1] = new Quadtree(this.pos.x + w, this.pos.y, w, h, level);
  this.nodes[2] = new Quadtree(this.pos.x, this.pos.y + h, w, h, level);
  this.nodes[3] = new Quadtree(this.pos.x + w, this.pos.y + h, w, h, level);
};

Quadtree.prototype.getIndex = function(obj) {
  var x = this.pos.x + this.siz.w / 2, // 중앙 경계선
      y = this.pos.y + this.siz.h / 2, // 중앙 경계선
      r = obj.radius;

  if (obj.x + r >= x && obj.x - r <= x)
	  return -1;
  if (obj.y + r >= y && obj.y - r <= y)
	  return -1;

  return (obj.x > x) + (obj.y > y) * 2;
};

Quadtree.prototype.insert = function(obj) {
  var i = 0,
      index;

  // 자식 노드가 있을 때
  if (typeof this.nodes[0] !== 'undefined') {
    index = this.getIndex(obj);
    if (index !== -1) {
      this.nodes[index].insert(obj);
      return;
    }
  }

  this.objects.push(obj);

  if (this.objects.length > 4) {
    if (typeof this.nodes[0] === 'undefined') {
      this.split();

      while( i < this.objects.length ) {

        index = this.getIndex( this.objects[ i ] );
  
        if( index !== -1 )
          this.nodes[index].insert( this.objects[ i ] );
        else
          i = i + 1;
      }
    }
    else if (this.getIndex(obj) !== -1)
      this.nodes[ this.getIndex(obj) ].insert(obj);
  }
};

Quadtree.prototype.retrieve = function( obj ) {
	var index = this.getIndex( obj ),
		returnObjects = this.objects;

	if( typeof this.nodes[0] !== 'undefined' ) {
		if( index !== -1 ) {
			returnObjects = returnObjects.concat( this.nodes[index].retrieve( obj ) );
		} else {
			for( var i=0; i < this.nodes.length; i=i+1 ) {
				returnObjects = returnObjects.concat( this.nodes[i].retrieve( obj ) );
			}
		}
	}

	return returnObjects;
};

Quadtree.prototype.clear = function() {
	this.objects = [];

	for( var i=0; i < this.nodes.length; i+=1 ) {
		if( typeof this.nodes[i] !== 'undefined' ) {
			this.nodes[i].clear();
		}
	}

	this.nodes = [];
};

module.exports = Quadtree;
/*
 * 노드에 오브젝트들이 5개 이상이 된다면, 자식 노드 4개를 생성한다.
 * 노드의 크기는 노드의 "중심" 좌표 (pos), 노드의 너비와 높이 (siz) 로 한다.
 */
