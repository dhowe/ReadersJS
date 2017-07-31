///////////////////// MesosticJumper /////////////////////

subclass(MesosticJumper, MesosticReader);

function MesosticJumper(g, rx, ry, speed) {

  MesosticReader.call(this, g, rx, ry, speed);
  this.type = 'MesosticJumper';
  this.activeFill = colorToObject(0, 149, 255, 255); // #0095FF
}

MesosticJumper.prototype.selectNext = function () {

  //if (this.current !== this.lastRead()) // TODO: quick fix for page-turning
    //letter = this.advanceLetter();

  var letter = this.advanceLetter(), dbug = 0;

  if (!letter)
    throw Error('No letter in MesosticJumper.selectNext');

  var next, ngramLineIdxs = [ 1, 2, 3, 4, 5, 6 ], last = this.lastRead(2);

  if (last) { // ignore n-grams if no last

    next = this.checkLines(letter, ngramLineIdxs, 3, last);

    // got nothing, now retry, with bigrams
    if (!next) {
      dbug && console.log("MesoJumper: no trigrams for '" + letter + "',  trying bigrams..."+(last?'':' no last!'));
      next = this.checkLines(letter, ngramLineIdxs, 2, last);
    }
  }

  // got nothing, now retry, ignoring ngrams
  if (!next) {
    dbug && console.log("MesoJumper: no bigrams for '" + letter + "',  trying w'out n-grams...");
    next = this.checkLines(letter, [1, 2, 3, 4 ], 0);
  }

  if (next) {

    this.letter = letter;
    return this.adjustSelected(next);
  }

  this.revertLetter(); // hack
  dbug && console.log("MesoJumper: nothing found for '" + letter + "',  trying superSelectNext ***");

  return Object.getPrototypeOf(MesosticJumper.prototype).selectNext.call(this);
}

MesosticJumper.prototype.checkLines = function (letter, targetLines, mode, last) {

  var result, p = Grid.coordsFor(this.current), grid = p.grid;

  OUTER: for (var j = 0; j < targetLines.length; j++)
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
    var matches = this.searchLineForLetter(letter, last, rtg, lineIdx, mode);

    if (matches.length)
    {
      result = matches[0];

      if (result && mode != 0 && result.distanceTo(this.current) > 500)
      {
        console.log("skipping big dist");
        result = null;
      }
      else
        break OUTER;
    }
  }

  return result;
}

MesosticJumper.prototype.searchLineForLetter = function(letter, last, rtg, lineIdx, mode) {

  if (!letter)
    throw Error("Bad letter: " + letter);

  if (lineIdx > rtg.numLines() - 1)
    throw Error("Bad line index: " + lineIdx);

  var rts, result = [], words = rtg.lineAt(lineIdx);

  //console.log('Search('+letter+'): line='+lineIdx+' mode=' + mode +
   //' curr=' + this.current.text()+' last=' + (last?last.text():'NULL'));

  try {

    // try each word in the line
    for (var i = 0; i < words.length; i++) {

      if (words[i] && words[i].includes(letter)) {

        if (mode === 3) {
          if (!this.pman.isTrigram(last.text(), this.current.text(), words[i].text()))
            continue;
        }
        else if (mode === 2) {
          if (!this.pman.isBigram(this.current.text(), words[i].text()))
            continue;
        }

        result.push(words[i]);
      }
    }
  }
  catch (e) {
    console.warn("searchLineForLetter() error...");
    throw e;
  }

  var currentCell = this.current;
  result.sort(function(x, y) {          // TODO: verify this sort is working correctly
    var d1 = currentCell.distanceTo(x);
    var d2 = currentCell.distanceTo(y);
    return y > x ? -1 : 1;
  });

  function str(r) {
    var s = '[';
    for (var i = 0; r && i < r.length; i++) {
      s += r[i].text() +' ';
    }
    return s.trim() + ']';
  }

  //console.log("Result="+str(result));

  return result;
}

MesosticJumper.prototype.onEnterCell = function (curr) {
  if (this.lastRead()) { // ignore first cell
    curr.fill(this.activeFill);
  }
}

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = MesosticJumper;
}
