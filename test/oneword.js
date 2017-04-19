var rt, rt2, font, state;

function preload() {

  font = loadFont('../fonts/times.ttf');
}

async function setup() {

  createCanvas(400, 400);

  RiText.defaultFont(font, 48);
  RiText.defaultFill(255,255,255,40);

  rt = RiText('Hello', 30, 50);
  // rt2 = RiText('there', 150, 50);

	state = "fades #1 and #2"
// this does NOT work (but it used to):
  rt.colorTo({r:255,g:0,b:0,a:255},10); // invocation #1 fade to red immediate
  rt.colorTo({r:0,g:255,b:0,a:255},5,5); // invocation #2 cancel #1 after 5 then fade to green

  await sleep(10000); // pause for 5 secs

	state = "reset & pause for ten"
	rt.colorTo({r:255,g:255,b:255,a:40},0); // BUG: if second arg is 0, this doesn't work


  await sleep(10000); // pause for 5 secs

  state = "fades #3 and #4";
  // this works:
  rt.colorTo({r:0,g:255,b:0,a:255},5,5); // invocation #3 [fade to green delayed by 5 seconds]
  rt.colorTo({r:255,g:0,b:0,a:255},10); // invocation #4: cancel #3 immediately, thus: just fade to red in 10


  /*
  rt.colorTo({r:0,g:255,b:0,a:255},2, 4); // this works - green
  rt.colorTo({r:0,g:0,b:255,a:255},2, 8); // this works - blue
  rt.colorTo({r:0,g:0,b:255,a:127},2, 12); // this works - dark blue
  rt.colorTo({r:255,g:0,b:0,a:127},2, 16); // this works - dark red
  rt.colorTo({r:255,g:0,b:0,a:255},2, 20); // this works - red
  */

//   rt2.colorTo([0,0,255,255],2, .00001); // fade to blue over 2 seconds
//   rt2.colorTo([255,0,0,255], 5, 2); // fade slowly back to red
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function draw() {

	background(0);
  RiText.drawAll();
  fill(255);
  text(state + " – " + round(millis()/100)/10,20,width-20);
}
