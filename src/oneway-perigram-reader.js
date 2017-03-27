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

  // if the direction is not viable delete the reader
  if (!this._isViableDirection(last, this.current, neighbors[this.wayToGo], neighbors[this.altWayToGo], this.wayToGo)) {

    if (++this.freeCount < 4) {  // DCH: was (this.freeCount++ < 4)

      return neighbors[this.wayToGo || this.altWayToGo];
    }

    Reader.dispose(this);
    //warn("Not viable heading " + Grid.direction(this.wayToGo));
    return null;
    // return neighbors[E] || this.current;
  }

  // continue viable:
  // info(neighbors[this.wayToGo || this.altWayToGo].text() + " (" + Grid.direction(this.wayToGo || this.altWayToGo) + ") ");

	if (neighbors[this.wayToGo] && neighbors[this.altWayToGo]) {

		return (Math.floor(Math.random() * 2) == 0) ? neighbors[this.wayToGo] : neighbors[this.altWayToGo];
	}

  return neighbors[this.wayToGo || this.altWayToGo];
}

// this version of _isViableDirection allows S or SE for SE and N or NE for NE
OnewayPerigramReader.prototype._isViableDirection = function (last, curr, neighbor, neighborAlt, dir) {

  var key, countThreshold, result = false,
    S = ' ',
    neighbors = [];

  neighbors.push(neighbor);
  neighbors.push(neighborAlt);

  if (!last || !curr || (!neighbor && !neighborAlt)) {
    //warn("Oneway has no S or SE neighbor = incomplete bigram key");
    return false;
  }

  dir = dir || -1; // legacy code

  var i = 0;
  for (; i < neighbors.length; i++) {

    if (!neighbors[i]) {

      //warn("no neighbors[" + i + "]");
      result = result || false;
    } else {

      key = (curr.text() + S + neighbors[i].text()).toLowerCase();
      key = RiTa.stripPunctuation(key);
      countThreshold = 0; // this._adjustForStopWords(0, key.split(S));

      result = result || PageManager.getInstance().isBigram(key, countThreshold);
      //info("key: '" + key + "' threshold: " + countThreshold + " result: " + result);
    }
    if (result) break; // found bigram for wayToGo direction
  }

  if (result) {

    info("Oneway - viable with: " + key + " (" + Grid.direction(this.wayToGo || this.altWayToGo) + ") " + countThreshold);
    this.freeCount = 0; // found bigram instance so allow more free diagonal steps
  }

  return result;
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = OnewayPerigramReader;
}
