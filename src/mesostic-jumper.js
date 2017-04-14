///////////////////// MesosticReader /////////////////////

subclass(MesosticJumper, Reader);

function MesosticJumper(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'MesosticJumper'; //  superclass variable(s)

  this.maxWordLen = Grid.maxWordLength();
  this.mesostic = TEXTS[0].mesostic;
  this.sendLinebreak = false;
  this.upperCasing = true;
  this.letterIdx = 0;
  this.letter = null;
  this.activeFill = colorToObject(0, 149, 255, 255); // #0095FF
}

var M = MesosticReader.prototype;

M.selectNext = function () {

  var letter = this.selectLetter();

  RiText result = this.checkLines(ngramLineIdxs, 3);

  // got nothing, now retry, with digrams
  if (!result) {
    DBUG && console.log("MesoJumper: no perigrams for '" + letter + "',  trying digrams...");
    result = this.checkLines(ngramLineIdxs, 2);
  }

  // got nothing, now retry, ignoring ngrams
  if (!result) {
    DBUG && console.log("MesoJumper: no digrams for '" + letter + "',  trying w'out ngrams...");
    result = cthis.checkLines([1, 2, 3, 4 ], 0);
  }

  // got nothing, now default to standard mesostic-reader
  if (!result) result = superSelectNext.superSelectNext(letter);

  return result;
}

M.checkLines = function (targetLines, mode) {

  var result, p = Grid.coordsFor(this.current), grid = p.grid;

  OUTER: for (int j = 0; j < targetLines.length; j++)
  {
    var rtg = grid;

    // use targets above
    var lineIdx = p.y + targetLines[j];

    // but last line wraps
    if (p.y == rtg.numLines() - 1) {
      lineIdx = j;
      rtg = rtg.getNext();
    }

    // don't go off the grid
    if (lineIdx > rtg.numLines() - 1)
      continue;

    // get matching words, ordered by x-distance
    var matches = (mode > 0) ? searchLineForLetterUsingNgrams(getTheLetter(), rtg, lineIdx, mode)
        : searchLineForLetter(getTheLetter(), rtg, lineIdx);

    if (!matches.isEmpty())
    {
      result = (RiText) matches.get(0);

      if (result != null && mode != 0 && result.distanceTo(currentCell) > 500)
      {
        // System.out.println("skipping big dist");
        result = null;
      }
      else
        break OUTER;
    }
  }

  return result;
}


M.superSelectNext = function (letter) {

  var next = this.current,
    cf = Grid.coordsFor(this.current),
    lineIdx = cf.y;

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

      return next; // retun the cell
    }
  }
}

M.selectLetter = function() {
  var letter;

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

  return letter;
}

M.onEnterCell = function (curr) {

  this.pman.defaultFill = curr.fill();
  curr.fill(this.activeFill);
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
  },

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
