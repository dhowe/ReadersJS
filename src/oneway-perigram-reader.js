///////////////////// OnewayPerigramReader /////////////////////

subclass(OnewayPerigramReader, PerigramReader);
// really only ever to-be-spawned
// requires a 'last' (read word) to allow for
// viable tri-grammatic perigrame look-ups

function OnewayPerigramReader(g, rx, ry, speed, dir, parent) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'OnewayPerigramReader'; //  superclass variable(s)
  this.wayToGo = dir;
  this.altWayToGo = (dir == 2) ? 1 : 7; // allowing N or S for NE or SE
  this.parentLast = parent;
  this.selectedLast = null;
  this.consoleString = '';
  this.fill = RiText.defaultFill();
  this.freeCount = 0;
  this.maxFreeCount = 5;
  this.neighbors = [];

  //Perigram Reader Color
  this.col = [194, 194, 194, 255]; // light gray

  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 10;
  this.delayFactor = 2.5;
}

OnewayPerigramReader.prototype.onEnterCell = function (curr) {

  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  this.gridColor = RiText.defaultFill(); // DCH: is this interface-responsive enough?

  // fading current in and out
  fid = curr.colorTo(this.col, this.fadeInTime);
  curr.colorTo(this.gridColor, this.fadeOutTime, this.delayBeforeFadeBack + this.fadeInTime); // 1st arg: this.fill

}

OnewayPerigramReader.prototype.selectNext = function () {

  var last;
  if (!this.selectedLast) last = this.parentLast;
  else last = this.lastRead(2);
  var neighbors = Grid.gridFor(this.current).neighborhood(this.current);

  return this._determineReadingPath(last, neighbors);
}

OnewayPerigramReader.prototype._determineReadingPath = function (last, neighbors) {

  if (!neighbors) throw Error("no neighbors");

  if (!this.current) throw Error("no current cell!");

  var vectorNeighbors = [];
  
  if (this._isViableDirection(this.current, neighbors[this.wayToGo]))
  	vectorNeighbors.push(neighbors[this.wayToGo]);
  if (this._isViableDirection(this.current, neighbors[this.altWayToGo]))
  	vectorNeighbors.push(neighbors[this.altWayToGo]);
  
  var nextCell = this._chooseCell(vectorNeighbors);
  
  if (nextCell != null) {
  	// info("Found bigram"); // DEBUG
  	this.freeCount = 0;
  }
  
  if ((nextCell == null) && (++this.freeCount < this.maxFreeCount)) {
		vectorNeighbors = [];
		if (neighbors[this.wayToGo]) vectorNeighbors.push(neighbors[this.wayToGo]);
		if (neighbors[this.altWayToGo]) vectorNeighbors.push(neighbors[this.altWayToGo]);
  	nextCell = this._chooseCell(vectorNeighbors);
  	// if (nextCell != null) info("Alive with no bigrams"); // DEBUG
  }
  
  if (nextCell == null) Reader.dispose(this);
  
  return nextCell;
}
  
OnewayPerigramReader.prototype._chooseCell = function (cells) {
	switch (cells.length) {
		case 2:
			return cells[Math.floor(Math.random() * 2)];
		case 1:
			return cells[0];
		default:
		return null;
	}
}

// simplified
OnewayPerigramReader.prototype._isViableDirection = function (curr, neighbor) {

  var key, countThreshold, result = false,
    S = ' ';

  if (!curr || !neighbor) {
    return false;
  }

  key = (curr.text() + S + neighbor.text()).toLowerCase();
  key = RiTa.stripPunctuation(key);
  countThreshold = 0; // this._adjustForStopWords(0, key.split(S));

  return result || PageManager.getInstance().isBigram(key, countThreshold);
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = OnewayPerigramReader;
}
