///////////////////// OnewayPerigramReader /////////////////////

subclass(OnewayPerigramReader, PerigramReader);
// really only ever to-be-spawned
// requires a 'last' (read word) to allow for
// viable tri-grammatic perigrame look-ups

function OnewayPerigramReader(g, rx, ry, speed, dir, parent) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'OnewayPerigramReader'; //  superclass variable(s)
  this.wayToGo = dir;
  this.parentLast = parent;
  this.selectedLast = null;
  this.consoleString = '';
  this.fill = RiText.defaultFill();
  this.eastCount = 0;

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

  var conText;

  this.consoleString = '';

	// adjust to allow S or SE for SE and N or NE for NE
	var altDir = (this.wayToGo == 8) ? 7 : 1; // 7 = S; 1 = N
  // if the direction is not viable delete the reader
  if (!this._isViableDirection(last, this.current, neighbors[this.wayToGo], neighbors[altDir], this.wayToGo)) {
  	if (this.eastCount++ < 2)
  		return neighbors[5] || this.current;
  	this.eastCount = 0;
    this.pause(true);
    warn("Not viable heading " + Grid.direction(this.wayToGo));
    return null;
		// return neighbors[E] || this.current;
  }

	// continue viable:
	
  // this._buildConTextForServer(wayToGo, neighbors);
  conText = neighbors[this.wayToGo].text().replace("—", "-"); // TEMP!

  if (neighbors[this.wayToGo]) {
		// this.consoleString = (neighbors[this.wayToGo].text() + " (" + Grid.direction(this.wayToGo) + ") ");
  }

  return neighbors[this.wayToGo] || this.current;
}

// this version of _isViableDirection allows S or SE for SE and N or NE for NE
OnewayPerigramReader.prototype._isViableDirection = function (last, curr, neighbor, neighborAlt, dir) {

  var result = false, key, S = ' ',
    countThreshold;
  var neighbors = [];
  neighbors.push(neighbor);
  neighbors.push(neighborAlt);

  if (!last || !curr || (!neighbor && !neighborAlt)) {
  	warn("Oneway found an incomplete trigram key");
    return false;
  }

  dir = dir || -1;

	var i = 0;
	for (; i < neighbors.length; i++) {
		if (!neighbors[i]) {
			warn("no neighbors[" + i + "]");
			result = result || false;
		}
		else {
			key = (curr.text() + S + neighbors[i].text()).toLowerCase();
			key = RiTa.stripPunctuation(key);
			countThreshold = 0; // this._adjustForStopWords(0, key.split(S));

			result = result || PageManager.getInstance().isBigram(key, countThreshold);
			info("key: '" + key + "' threshold: " + countThreshold + " result: " + result);
		}
		if (result) break;
  }

  if (result) {
  	info("Oneway - viable " + ((i == 0) ? "SE" : "S") + ": " + key + " (" + Grid.direction(dir) + ") " + countThreshold);
  	this.eastCount = 0;
	}
	
  return result;
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = OnewayPerigramReader;
}
