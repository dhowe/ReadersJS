var rt, font, bb;

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(400, 400);

  RiText.defaultFont(font, 48);
  rt =  RiText('Hello there', 30, 50);
  bb = rt.boundingBox();
  noFill();
}


function draw() {

	background(255);
  rt.draw();
  rect(bb.x, bb.y, bb.width, bb.height);
}
