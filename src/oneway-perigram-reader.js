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

  //Perigram Reader Color
  this.col = [194, 194, 194, 255]; // light gray
  
  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 10;
  this.delayFactor = 2.5;
}

OnewayPerigramReader.prototype.onEnterCell = function (curr) {

  // console.log('onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG
  
  // ---- based on Java VB NeighborFadingVisual ---- //
  // variables needed individually for instances of perigram readers:
  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  this.gridColor = RiText.defaultFill(); // DCH: is this interface-responsive enough?
  this.leadingFadeToColor = this.gridColor.slice(0);
  this.trailingFadeToColor = this.gridColor.slice(0);
  // DCH: may not work with the other 'theme' can we use alphas instead?
  this.leadingFadeToColor = this.leadingFadeToColor.fill(this.gridColor[0] + (255 - this.gridColor[0]) / 4, 0, 3);
  this.trailingFadeToColor = this.trailingFadeToColor.fill(this.gridColor[0] + (255 - this.gridColor[0]) / 6, 0, 3);

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

  var NW = 0,
    N = 1,
    NE = 2,
    W = 3,
    E = 5,
    SW = 6,
    S = 7,
    SE = 8,
    conText;

  this.consoleString = '';

  // if the direction is not viable delete the reader
  if (!this._isViableDirection(last, this.current, neighbors[this.wayToGo], this.wayToGo)) {
    this.pause(true);
    return this.current;
//     console.log("not viable");
//     return neighbors[E] || this.current;
  }

  console.log("viable");

  //this._buildConTextForServer(wayToGo, neighbors);
  conText = neighbors[this.wayToGo].text().replace("—", "-"); // TEMP!

  if (neighbors[this.wayToGo]) {
    this.consoleString = (neighbors[this.wayToGo].text() + " (" +
      Grid.direction(this.wayToGo) + ") ");
  }

  return neighbors[this.wayToGo] || this.current;
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = OnewayPerigramReader;
}
