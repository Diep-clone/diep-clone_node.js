function DrawObject(){
  this.canvas = document.getElementById("canvas");
  this.ctx = canvas.getContext("2d");
  this.ui_canvas = document.createElement("canvas");
  this.ui_ctx = ui_canvas.getContext("2d");
  this.camera = {
    x:0,
    y:0,
    z:3
  }
  this.resize = function (){
    this.canvas.width=this.ui_canvas.width=window.innerWidth * window.devicePixelRatio;
    this.canvas.height=this.ui_canvas.height=window.innerHeight * window.devicePixelRatio;
  }
  this.objectDraw = function (){
    
  }
  this.uiDraw = function (){
    
  }
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var ui_layer = document.createElement("canvas");
var ui_ctx = ui_layer.getContext("2d");

var camera = {
  x:0,
  y:0,
  z:3
};

function onResize(){
  canvas.width=ui_layer.width=window.innerWidth * window.devicePixelRatio;
  canvas.height=ui_layer.height=window.innerHeight * window.devicePixelRatio;
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

var tick = 0;
var last_time = Date.now();

function draw_(){
  if (canvas.width<canvas.height/9*16) camera.z=canvas.height/900*1.78; // 화면 크기에 따른 줌값 조정
  else camera.z=canvas.width/1600*1.78; // *1.78 은 1레벨 탱크의 시야 
  
  tick = Date.now() - last_time;
  last_time = Date.now();

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ui_ctx.clearRect(0,0,canvas.width,canvas.height);
  
  ctx.beginPath(); // 격자 그리기
  for (let i=-camera.x % 20 * camera.z;i<=canvas.width;i+=12.9 * camera.z){
      ctx.moveTo(i,0);
      ctx.lineTo(i,canvas.height);
  }
  for (let i=-camera.y % 20 * camera.z;i<=canvas.height;i+=12.9 * camera.z){
      ctx.moveTo(0,i);
      ctx.lineTo(canvas.width,i);
  }
  ctx.strokeStyle = "black";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.1;
  ctx.stroke();

  for (var i=0;i<object_list.length;i++){
    if (object_list[i]){
      object_list[i].draw();
      object_list[i].animate();
    }
  }

  requestAnimationFrame(draw_);
}

draw_();
