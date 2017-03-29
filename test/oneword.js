var rt, rt2, font;

function preload() {

  font = loadFont('../fonts/times.ttf');
}

function setup() {

  createCanvas(400, 400);

  RiText.defaultFont(font, 48);
  RiText.defaultFill(255,0,0);

  rt =  RiText('Hello', 30, 50);
  rt2 =  RiText('there', 150, 50);

  rt.colorTo({r:0,g:0,b:0},1,5); // fade to black after 5

  rt2.colorTo([0,0,255,255],5,1); // fade slowly to blue
}


function draw() {

	background(0);
  RiText.drawAll();
  //console.log(rt2.fill().r, rt2.fill().g, rt2.fill().b);
}
