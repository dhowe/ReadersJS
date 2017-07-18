///////////////////// MesosticReader /////////////////////

subclass(MesosticReader, Reader);

function MesosticReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'MesosticReader'; //  superclass variable(s)

  this.maxWordLen = Grid.maxWordLength();
  this.setMesostic(TEXTS[0].mesostic);
  this.upperCasing = true;

  this.defaultColorDark = hexToRgb("#0095FF"); // blue
  this.defaultColorLight = hexToRgb("#1C76D6");
  this.activeFill = this.defaultColorDark;
}

var M = MesosticReader.prototype;

M.revertLetter =  function () {
  this.letterIdx = this.lastLetterIdx;
}

M.setMesostic =  function (mesostic) {
  this.mesostic = mesostic;
  this.sendLinebreak = false;
  this.letterIdx = 0;
  this.letter = null;
}

M.advanceLetter =  function () {

  //console.log('MesosticReader.advanceLetter');
  var letter;

  while (1) { // find the next letter

    letter = this.mesostic.charAt(this.letterIdx);

    this.lastLetterIdx = this.letterIdx;
    if (++this.letterIdx == this.mesostic.length)
      this.letterIdx = 0;

    if (letter.match(/[A-Za-z]/)) { // non-punct

      if (this.letterIdx === 1) // end-of-phrase
        this.sendLinebreak = true;

      letter = letter.toLowerCase();
      break;

    } else {

      this.sendLinebreak = true; // for punct/space, just send line-break
    }
  }

  return letter;
}

M.adjustSelected =  function (sel) {

  sel.text(sel.text().replace(/[()’‘?]/g,''));
  if (this.upperCasing) {
    this.doUpperCasing(sel);
  }
  return sel;
}

M.selectNext = function () {

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

M.doUpperCasing = function(next) {

    var originalWidth = next.textWidth();
    next.replaceChar(next.indexOf(this.letter), this.letter.toUpperCase());
    next.x -= (next.textWidth() - originalWidth) / 2;
}

M.onEnterCell = function (curr) {

  // this.pman.defaultFill = curr.fill();
  curr.colorTo(this.activeFill, .3);
}

M.onExitCell = function (curr) {

  curr.colorTo(this.pman.defaultFill, 1);
  Grid.resetCell(curr, true);
}

M.textForServer = function () {

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

M._pad = function (raw, c, idx) {

  var pre = raw.substring(0, idx),
    padStr = '';
  for (var i = 0; i < this.maxWordLen - pre.length - 1; i++)
    padStr += ' ';

  return padStr + raw;
}

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = MesosticReader;
}
