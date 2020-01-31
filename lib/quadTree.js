
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
/*
 * 노드에 오브젝트들이 5개 이상이 된다면, 자식 노드 4개를 생성한다.
 * 노드의 크기는 노드의 "중심" 좌표 (pos), 노드의 너비와 높이 (siz) 로 한다.
 */
