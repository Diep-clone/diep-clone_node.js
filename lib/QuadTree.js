
function Quadtree(x, y, w, h, level){
  this.pos = {x:x, y:y};
  this.siz = {w:w, h:h};
  this.level = level;
  this.objects = [];
  this.nodes = [];
};

Quadtree.prototype.split = function (){  
  var level = this.level + 1,
      w     = this.w / 2,
      h     = this.h / 2;
  
  /* index
   *  0 1
   *  2 3
   */
  
  this.nodes[0] = new QuadTree(x, y, w, h, level);
  this.nodes[1] = new QuadTree(x + w, y, w, h, level);
  this.nodes[2] = new QuadTree(x, y + h, w, h, level);
  this.nodes[3] = new QuadTree(x + w, y + h, w, h, level);
};

Quadtree.prototype.getIndex = function(obj) {		
  var x = this.x + this.w / 2, 
      y = this.y + this.h / 2;
  
  // 경계선에 걸치는지 검사
  
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
    }
	 
	//add all objects to there corresponding subnodes
	while( i < this.objects.length ) {

		index = this.getIndex( this.objects[ i ] );

		if( index !== -1 ) {					
			this.nodes[index].insert( this.objects.splice(i, 1)[0] );
		} else {
			i = i + 1;
		}
	}
  }
  
};

Quadtree.prototype.retrieve = function( obj ) {

	var 	index = this.getIndex( obj ),
		returnObjects = this.objects;

	//if we have subnodes ...
	if( typeof this.nodes[0] !== 'undefined' ) {

		//if pRect fits into a subnode ..
		if( index !== -1 ) {
			returnObjects = returnObjects.concat( this.nodes[index].retrieve( obj ) );

		//if pRect does not fit into a subnode, check it against all subnodes
		} else {
			for( var i=0; i < this.nodes.length; i=i+1 ) {
				returnObjects = returnObjects.concat( this.nodes[i].retrieve( obj ) );
			}
		}
	}

	return returnObjects;
};

exports = Quadtree;
/*
 * 노드에 오브젝트들이 5개 이상이 된다면, 자식 노드 4개를 생성한다.
 * 노드의 크기는 노드의 "중심" 좌표 (pos), 노드의 너비와 높이 (siz) 로 한다.
 */
