///////////////////// MesosticReader /////////////////////

subclass(MesosticReader, Reader);

function MesosticReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'MesosticReader'; //  superclass variable(s)

  this.maxWordLen = Grid.maxWordLength();
  this.mesostic = TEXTS[0].mesostic;
  this.sendLinebreak = false;
  this.upperCasing = true;
  this.letterIdx = 0;
  this.letter = null;
  this.defaultColorDark = hexToRgb("#0095FF"); // blue
  this.defaultColorLight = hexToRgb("#1C76D6");

  this.activeFill = this.defaultColorDark;
}

var M = MesosticReader.prototype;

M.selectNext = function () {

  var letter, next = this.current,
    cf = Grid.coordsFor(this.current),
    lineIdx = cf.y;

  while (1) { // find the next letter

    letter = this.mesostic.charAt(this.letterIdx);

    if (++this.letterIdx == this.mesostic.length)
      this.letterIdx = 0;

    if (letter.match(/[A-Za-z]/)) { // non-punct

      if (this.letterIdx == 1) // end-of-phrase
        this.sendLinebreak = true;

      letter = letter.toLowerCase();
      break;

    } else { // for punct, just send line-break

      this.sendLinebreak = true; // a space
    }
  }

  //letter = letter.toLowerCase();

  while (1) { // find next word containing the letter (not on the same line)

    next = Grid.nextCell(next);

    if (lineIdx == Grid.coordsFor(next).y) // ignore same line
      continue;

    if (next.text().match(letter)) {

      if (this.upperCasing) {

        var originalWidth = next.textWidth();
        next.replaceChar(next.indexOf(letter), letter.toUpperCase());
        next.x -= (next.textWidth() - originalWidth) / 2;
      }

      this.letter = letter;

      return next;
    }
  }
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

/* M._resetLine = function(rt) {
		var cf = Grid.coordsFor(rt);
		var line = cf.grid.lineAt(cf.y), s='';
		for(var i=0,j=line.length; i<j; i++)
		s += line[i].text() + " ";
		console.log(s);
}*/

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = MesosticReader;
}
