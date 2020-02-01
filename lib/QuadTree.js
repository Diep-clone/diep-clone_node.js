
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

exports = Quadtree;
/*
 * 노드에 오브젝트들이 5개 이상이 된다면, 자식 노드 4개를 생성한다.
 * 노드의 크기는 노드의 "중심" 좌표 (pos), 노드의 너비와 높이 (siz) 로 한다.
 */
