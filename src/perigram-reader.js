///////////////////// PerigramReader /////////////////////

subclass(PerigramReader, Reader);
// these apply to all perigram readers:

function PerigramReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'PerigramReader'; //  superclass variable(s)

  this.phrase = '';
  this.consoleString = '';
  this.downWeighting = .6;
  this.upWeighting = .12;
  this.defaultColorDark = hexToRgb("#FA0007"); // red
  this.defaultColorLight = hexToRgb("#C711F24");

  if (!speed) this.speed = SPEED.Fluent; // default speed for PerigramReaders

  this.activeFill = this.defaultColorDark
  // this.neighborCol = [127, 10, 30, 255];

  this.fadeInFactor = .9;
  this.fadeOutFactor = 10;
  this.delayFactor = 3;
  this.currentKey = undefined;
}

PerigramReader.prototype.selectNext = function () {

  var last = this.lastRead(2),
    neighbors = Grid.gridFor(this.current).neighborhood(this.current);

  return this._determineReadingPath(last, neighbors);
}

PerigramReader.prototype.onEnterCell = function (curr) {

  // console.log('onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG

  // ---- based on Java VB NeighborFadingVisual ---- //
  // variables needed individually for instances of perigram readers:
  this.actualStepTime = this.stepTime / 1000;
  // info("Perigram actualStepTime: " + this.actualStepTime); // DEBUG
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

PerigramReader.prototype.onExitCell = function (curr) {

  // console.log('onExit: '+curr);
  //curr.colorTo(this.neighborCol, this.speed * .8, this.speed); // DCH: 2/2/2017
  //curr.showBounds(0);
}

/*PerigramReader.prototype.hide = function (v) { // needed?
	this.hidden = v;
	if (this.hidden) {
		var c = RiText.defaultFill();
		//setTimeout(function(){},100);
		this.current.stopBehaviors();
	  this.current.fill(c);
	}
}*/

PerigramReader.prototype.textForServer = function () {

  var rts = this.currentKey;

  if (!rts || !rts.length || !rts[0]) {
    //console.warn("Waiting for currentKey...");
    return;
  }

  if (rts.length !== 3)
    throw Error("Invalid args: "+arguments[0]);

  //console.log('textForServer: ',rts[0].text(),rts[1].text(),rts[2].text());

	if (this.pman.isTrigram(rts[0].text(),rts[1].text(),rts[2].text())) {
		this.phrase = this.phrase + this.current.text() + ' ';
		return; // just adding the current word
	}

	var msg = this.phrase.trim();
	this.phrase = this.current.text() + ' ';
	// info(msg); // DEBUG
  return msg;
}

PerigramReader.prototype._determineReadingPath = function (last, neighbors) {

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

PerigramReader.prototype._isViableDirection = function (last, curr, neighbor, dir) {

  dir = dir || -1;

  var result, countThreshold;

  if (!last || !curr || !neighbor)
    return false;

  countThreshold = this._adjustForStopWords(0, key.split(' '));

  result = this.pman.isTrigram(last.text(), curr.text(), neighbor.text(), countThreshold);

  if (result) {
   //info("Perigram_isViable found: " + key + " (" + Grid.direction(dir) + ") " + countThreshold);
	}

  return result;
}

PerigramReader.prototype._adjustForStopWords = function (countThreshold, words) {

  for (var i = 0; i < words.length; i++) {
    // order of testing is significant
    // actual stop words first (more of them with more 'semantics'
    // so they don't require as high an initial countThreshold rise)

    if (Reader.STOP_WORDS.indexOf(words[i]) > -1)
      countThreshold += (countThreshold < 5) ? 5 : 50;

    if (Reader.CLOSED_CLASS_WORDS.indexOf(words[i]) > -1)
      countThreshold += (countThreshold < 10) ? 15 : 175;
  }

  return countThreshold;
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = PerigramReader;
}
