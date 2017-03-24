///////////////////// SpawningPerigramReader /////////////////////

subclass(SpawningPerigramReader, PerigramReader);
// these apply to all perigram readers:

function SpawningPerigramReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'SpawningPerigramReader'; //  superclass variable(s)

  this.consoleString = '';
  this.downWeighting = .6;
  this.upWeighting = .12;

  this.fill = RiText.defaultFill(); // or another color?
  if (!speed) this.speed = SPEED.Fluent; // default speed for SpawningPerigramReaders

  //Perigram Reader Color
  this.col = [189, 5, 4, 255]; // red
  // this.neighborCol = [127, 10, 30, 255];
  
  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 10;
  this.delayFactor = 2.5;
  
}

SpawningPerigramReader.prototype.onEnterCell = function (curr) {

  // console.log('onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG
  
  // ---- based on Java VB NeighborFadingVisual ---- //
  // variables needed individually for instances of perigram readers:
  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  this.gridColor = RiText.defaultFill(); // DCH: is this interface-responsive enough?

  // fading current in and out
  fid = curr.colorTo(this.col, this.fadeInTime);
  curr.colorTo(this.gridColor, this.fadeOutTime, this.delayBeforeFadeBack + this.fadeInTime); // 1st arg: this.fill
  
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = SpawningPerigramReader;
}
