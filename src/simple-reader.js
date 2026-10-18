///////////////////////// SimpleReader /////////////////////////

subclass(SimpleReader, SpawningSimpleReader);
// the SpawningSimpleReader without the spawning: same path (the next word to the
// east) and fades, but it never creates OnewayPerigramReaders. Its colour is
// floralwhite (a warm near-black in the light theme) and it starts at the top left of the verso
// page, and goes back there when the text changes (see resetText()).
//
// It is available only through the URL (?readers=SimpleReader, ?focus=... or
// ?solo=..., see src/url-params.js): it starts off, and its row in the options
// menu is hidden (see 'urlOnly' in createInterface() and style.css).

function SimpleReader(g, rx, ry, speed) {

  SpawningSimpleReader.call(this, g, rx, ry, speed); // speed (Fluent) etc.
  this.type = 'SimpleReader';

  this.defaultColorDark = hexToRgb("#FFFAF0"); // floralwhite
  this.defaultColorLight = hexToRgb("#3B3228"); // warm near-black, to show on the light theme
  this.activeFill = this.defaultColorDark;
  this.startsOnVerso = true; // see resetText() in multi-page.js

  this.hidden = true; // off until turned on by the URL
  this.urlOnly = true; // no visible menu row

  // a hidden reader never recomputes its step time, and without a speed it
  // starts as NaN (a timer that fires continuously)
  this.stepTime = this.speed * 1000;
}

SimpleReader.prototype.onEnterCell = function (curr) {

  // as SpawningSimpleReader.onEnterCell, without the spawning
  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;

  curr.colorTo(this.activeFill, this.fadeInTime);
  curr.colorTo(this.pman.defaultFill, this.fadeOutTime, this.speed * this.delayFactor + this.fadeInTime);
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = SimpleReader;
}
