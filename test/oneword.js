var rt, rt2, font;

function preload() {

  font = loadFont('../fonts/times.ttf');
}

function setup() {

  createCanvas(400, 400);

  RiText.defaultFont(font, 48);
  RiText.defaultFill(255,255,255,40);

  rt = RiText('Hello', 30, 50);
  rt2 = RiText('there', 150, 50);

  rt.colorTo({r:255,g:0,b:0,a:255},2); // fade to red over 2 seconds

  /*
  rt.colorTo({r:0,g:255,b:0,a:255},2, 4); // this works - green
  rt.colorTo({r:0,g:0,b:255,a:255},2, 8); // this works - blue
  rt.colorTo({r:0,g:0,b:255,a:127},2, 12); // this works - dark blue
  rt.colorTo({r:255,g:0,b:0,a:127},2, 16); // this works - dark red
  rt.colorTo({r:255,g:0,b:0,a:255},2, 20); // this works - red
  */

  rt2.colorTo([0,0,255,255],2, .00001); // fade to blue over 2 seconds
  rt2.colorTo([255,0,0,255], 5, 2); // fade slowly back to red
}


function draw() {

	background(0);
  RiText.drawAll();
  //console.log(rt2.fill().r, rt2.fill().g, rt2.fill().b);
}
