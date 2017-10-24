///////////////////// MarkovJumper /////////////////////

subclass(MarkovJumper, Reader);

function MarkovJumper(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'MarkovJumper'; //  superclass variable(s)

  this.phrase = '';
  this.consoleString = '';
  this.downWeighting = .6;
  this.upWeighting = .12;
  this.defaultColorDark = hexToRgb("#FA0007"); // red
  this.defaultColorLight = hexToRgb("#C711F24");

  if (!speed) this.speed = SPEED.Fluent; // default speed for MarkovJumpers

  this.activeFill = this.defaultColorDark
  // this.neighborCol = [127, 10, 30, 255];

  this.fadeInFactor = .9;
  this.fadeOutFactor = 10;
  this.delayFactor = 3;
  this.currentKey = undefined;
}

MarkovJumper.prototype.selectNext = function () {

  var last = this.lastRead(2),
    neighbors = Grid.gridFor(this.current).neighborhood(this.current);
    info(this.current.text() + " neighbors: " + neighbors); // DEBUG

  return this._determineReadingPath(last, neighbors);
}

/* 
MarkovJumper.prototype.onEnterCell = function (curr) {

  // console.log('onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG

  // ---- based on Java VB NeighborFadingVisual ---- //
  // variables needed individually for instances of MarkovJumpers:
  this.actualStepTime = this.stepTime / 1000;
  // info("Markov actualStepTime: " + this.actualStepTime); // DEBUG
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.speed * this.fadeOutFactor + 1; // actualStepTime or speed
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor + .5; // actualStepTime or speed
  this.leadingFadeToColor = cloneColor(this.pman.defaultFill);
  this.leadingFadeToColor.a = this.leadingFadeToColor.a + 128;

  // get and fade in neighborhood
  this.neighborhood = Grid.gridFor(curr).neighborhood(curr);

  // filter recently read words out of the neighborhood
  this.neighborsToFade = [];
  for  (var i = 0; i < this.neighborhood.length; i++) {
  	// warn("curr is found in a neighborhood."); // DEBUG
    if (this.neighborhood[i] &&  (this.neighborhood[i] != curr) && (this.neighborhood[i] != this.lastRead(2)) && (this.neighborhood[i] != this.lastRead(3))) {
      if (this.neighborsToFade.indexOf(this.neighborhood[i]) < 0) this.neighborsToFade.push(this.neighborhood[i]);
    }
  }

  // console.log('Y ' + this.neighborsToFade);

  // do the fading
  for (var i = 0; i < this.neighborsToFade.length; i++) {
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.leadingFadeToColor, this.fadeInTime);
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.pman.defaultFill, this.fadeOutTime, this.delayBeforeFadeBack + this.speed);
  }

  // fading current in and out
  fid = curr.colorTo(this.activeFill, this.fadeInTime);
  curr.colorTo(this.pman.defaultFill, this.fadeOutTime, this.delayBeforeFadeBack + this.speed); // delayBeforeFadeBack

}
 */

/* 
MarkovJumper.prototype.textForServer = function () {

  var rts = this.currentKey;

  if (!rts || !rts.length || !rts[0])
    return;

  if (rts.length !== 3)
    throw Error("Invalid args: "+arguments[0]);

  //console.log('textForServer: ',rts[0].text(),rts[1].text(),rts[2].text());

	if (this.pman.isTrigram(rts[0].text(),rts[1].text(),rts[2].text())) {

		this.phrase = this.phrase + this.current.text() + ' ';
		return; // just adding the current word
	}

	var msg = this.phrase.trim();
	this.phrase = this.current.text() + ' ';  // huh? awk
	// info(msg); // DEBUG
  return msg;
}
 */

MarkovJumper.prototype._determineReadingPath = function (last, neighbors) {

  if (!neighbors) throw Error("no neighbors");

  if (!this.current) throw Error("no current cell!");

  var NEConText, SEConText, NEViable, SEViable, NW = 0,
    N = 1,
    NE = 2,
    W = 3,
    E = 5,
    SW = 6,
    S = 7,
    SE = 8,
    wayToGo = E,
    conText;

	return neighbors[E]; // DEBUG TEMP

  this.consoleString = '';

  // only go NE if it is viable
  if (this._isViableDirection(last, this.current, neighbors[NE], NE)) {
    wayToGo = NE;
    NEViable = true;
  }

  if (wayToGo == NE) {
    // collect the context in any case
    NEConText = this.current.text() + " " + neighbors[NE].text();

    // but only actually go NE rarely
    wayToGo = (Math.random() < this.upWeighting) ? NE : E;
  }

  // only go SE if it is viable
  if (this._isViableDirection(last, this.current, neighbors[SE], SE))
    SEViable = true;

  if (SEViable && wayToGo == E)
    wayToGo = SE;

  if (wayToGo == SE) {
    // collect the context in any case
    SEConText = this.current.text() + " " + neighbors[SE].text();

    // but only actually go SE occasionally
    wayToGo = (Math.random() < this.downWeighting) ? SE : E;
  }

  //this._buildConTextForServer(wayToGo, neighbors);
  conText = neighbors[wayToGo].text().replace("—", "-"); // TEMP!

  if (neighbors[wayToGo]) {
//     this.consoleString = (neighbors[wayToGo].text() + " (" + Grid.direction(wayToGo) + ") ");
  }

  this.lastDirection = wayToGo;
  this.currentKey = [last, this.current, neighbors[wayToGo]];

  switch (wayToGo) {
  case NE:
	   return neighbors[NE];

  case SE:
    return neighbors[SE];

  default:
    return neighbors[E] || this.current;
  }
}

/* 
MarkovJumper.prototype._isViableDirection = function (last, curr, neighbor, dir) {

  dir = dir || -1;

  var result, countThreshold;

  if (!last || !curr || !neighbor)
    return false;

  //countThreshold = this._adjustForStopWords(0, key.split(' ')); // JC: no key here ??
  countThreshold = this._weightStopWords(0, last, curr, neighbor);

  result = this.pman.isTrigram(last.text(), curr.text(), neighbor.text(), countThreshold);

  if (result) {
   //info("Markov _isViable found: " + key + " (" + Grid.direction(dir) + ") " + countThreshold);
	}

  return result;
}
 */

/* 
MarkovJumper.prototype._weightStopWords = function (countThreshold, word1, word2, word3) {

  if (arguments.length !== 4)
    throw Error('Invalid args1: '+arguments.length);

  var thresholdCount = Array.prototype.shift.apply(arguments);

  if (arguments.length !== 3)
    throw Error('Invalid args2: '+arguments.length);

  for (var i = 0; i < arguments.length; i++) {

    // order of testing is significant
    // actual stop words first (more of them with more 'semantics'
    // so they don't require as high an initial countThreshold rise)

    if (Reader.STOP_WORDS.indexOf(arguments[i]) > -1)
      thresholdCount += (thresholdCount < 5) ? 5 : 50;

    if (Reader.CLOSED_CLASS_WORDS.indexOf(arguments[i]) > -1)
      thresholdCount += (thresholdCount < 10) ? 15 : 175;
  }

  return thresholdCount;
}
 */

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = MarkovJumper;
}
