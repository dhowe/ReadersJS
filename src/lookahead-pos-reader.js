///////////////////// LookaheadReader /////////////////////

subclass(LookaheadReader, Reader);

function LookaheadReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'LookaheadReader'; //  superclass variable(s)
}

LookaheadReader.prototype.selectNext = function () {

  var next = this.current,
    cf = Grid.coordsFor(this.current),
    lineIdx = cf.y;

  var letter = this.advanceLetter();

  while (1) { // find next word containing the letter (not on the same line)

    next = Grid.nextCell(next);

    var nt = next.text(); // tmp
    if (lineIdx == Grid.coordsFor(next).y) // ignore same line
      continue;

    if (next.text().match(letter)) {

      this.letter = letter;

      return this.adjustSelected(next);
    }
  }
}

LookaheadReader.prototype.textForServer = function () {

  var lett, tfs, txt = this.current.text();

  if (!this.letter) return '';

  lett = this.letter.toUpperCase();

  tfs = this._pad(txt, lett, txt.indexOf(lett));

  if (this.sendLinebreak) {

    this.sendLinebreak = false;
    tfs = "\n" + tfs;
  }

  return tfs;
}

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = LookaheadReader;
}
