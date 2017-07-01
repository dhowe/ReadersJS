///////////////////// SpawningPerigramReader /////////////////////

subclass(SpawningPerigramReader, SpawningSimpleReader);
// these apply to all perigram readers:

function SpawningPerigramReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'SpawningPerigramReader'; //  superclass variable(s)

  this.consoleString = '';
  this.currentKey = '';
  this.phrase = '';
  this.downWeighting = .6;
  this.upWeighting = .12;
  this.defaultColorDark = hexToRgb("#FF5100"); // orange
  this.defaultColorLight = hexToRgb("#D75F22");

  if (!speed) this.speed = SPEED.Fluent; // default speed for SpawningPerigramReaders

  this.activeFill = this.defaultColorDark;
  // this.neighborCol = [127, 10, 30, 255];

  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 10;
  this.delayFactor = 2.5;
}

SpawningPerigramReader.prototype.selectNext = function () {

  var last = this.lastRead(2),
    neighbors = Grid.gridFor(this.current).neighborhood(this.current);
  var selected = this._determineReadingPath(last, neighbors);
  // info("bigram count of " + this.current.text() + "+" + selected.text() + ": " + this.pman.bigramCount([this.current, selected]));

  return selected; // DEBUGGING this._determineReadingPath(last, neighbors);
}

SpawningPerigramReader.prototype._determineReadingPath = function (last, neighbors) {

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
  // conText = neighbors[wayToGo].text().replace("—", "-"); // TEMP!

  if (neighbors[wayToGo]) {
//     this.consoleString = (neighbors[wayToGo].text() + " (" + Grid.direction(wayToGo) + ") ");
  }

  this.lastDirection = wayToGo;
  this.currentKey = [ last, this.current, neighbors[wayToGo] ];

  switch (wayToGo) {
  case NE:
    return neighbors[NE];

  case SE:
    return neighbors[SE];

  default:
    return neighbors[E] || this.current;
  }
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = SpawningPerigramReader;
}
