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

im_count = 0;
var tick = 0;
var last_time = Date.now();

function draw_(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ui_ctx.clearRect(0,0,canvas.width,canvas.height);

  tick = Date.now() - last_time;
  last_time = Date.now();
  
  for (var i=0;i<object_list.length;i++){
    if (object_list[i]){
      object_list[i].draw();
    }
  }
  
  //ui_ctx.

  requestAnimationFrame(draw_);
}

draw_();
