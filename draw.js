var canvas_ = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var ui_layer = document.createElement("canvas");
var ui_ctx = ui_layer.getContext("2d");

var camera = {
  x:0,
  y:0,
  z:3
};

function onResize(){
  canvas_.width=ui_layer.width=window.innerWidth * window.devicePixelRatio;
  canvas_.height=ui_layer.height=window.innerHeight * window.devicePixelRatio;
}

function RGB(r,g,b){
  this.r= r;
  this.g= g;
  this.b= b;
  this.setRGB = function(r,g,b){
    this.r=r;
    this.g=g;
    this.b=b;
  }
  this.getRGB = function(){
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
  }
  this.getDarkRGB = function(){
    return "rgb(" + this.r*0.74 + "," + this.g*0.74 + "," + this.b*0.74 + ")";
  }
  this.getLightRGB = function(){

  }
  this.getRedRGB = function(){

  }
}


window.onbeforeunload=function(){
  return "정말 나가실 건가요?";
}

window.onresize=onResize;
onResize();

function draw_(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ui_ctx.clearRect(0,0,canvas.width,canvas.height);
  
  ctx.beginPath(); // 격자 그리기
  for (let i=-camera.x % 20 * camera.z;i<=canvas.width;i+=13 * camera.z){
      ctx.moveTo(i,0);
      ctx.lineTo(i,canvas.height);
  }
  for (let i=-camera.y % 20 * camera.z;i<=canvas.height;i+=13 * camera.z){
      ctx.moveTo(0,i);
      ctx.lineTo(canvas.width,i);
  }
  ctx.strokeStyle = "black";
  ctx.globalAlpha = 0.1;
  ctx.lineWidth = 0.2;
  ctx.stroke();

  for (var i=0;i<object_list.length;i++){
    if (object_list[i]){
      object_list[i].draw();
    }
  }
  
  //ui_ctx.

  requestAnimationFrame(draw_);
}

draw_();
