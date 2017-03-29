var rt, font, bb;

function preload() {

  font = loadFont('../fonts/times.ttf');
}

function setup() {

  createCanvas(400, 400);

  RiText.defaultFont(font, 48);
  rt =  RiText('Hello there', 30, 50);
  bb = rt.boundingBox();
  rt.fill(255,0,0);

  rt.colorTo({r:0,g:0,b:0,a:0},1,1); // fade to black
  // OR rt.colorTo([0,0,0,0],1,1);
}


function draw() {

	background(0);
  rt.draw();

  //rect(bb.x, bb.y, bb.width, bb.height);
}
