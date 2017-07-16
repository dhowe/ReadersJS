///////////////////// LookaheadReader /////////////////////

subclass(LookaheadReader, Reader);

var DBUG = false, MAX_LINE_JUMP = 5;
var phrases = [], allowedSubstitutions = "nn nns vb vbg vbn jj jjr jjs "; // end with space

function LookaheadReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed);
  this.type = 'LookaheadReader';
}

LookaheadReader.prototype.selectNext = function () {

  // var next = this.current,
  //   cf = Grid.coordsFor(this.current),
  //   lineIdx = cf.y;

  var tries = 0, maxLookahead = 200;

  var next = grid.nextCell(currentCell);
  var toReplace = next;

  var pos = next.get(RiTa.POS);
  if (!pos) return print(next);

  if (!allowedSubstitutions.contains(pos+" "))
    return print(next);

  if(DBUG) console.log("  Found pos("+pos+") "+next);

  var tmp = Grid.gridFor(next);

  while (tries++ < maxLookahead)
  {
    next = tmp.nextCell(next);

    // check the length ==================================
    if (next.length() < 2) continue;

    // match the part-of-speech ==========================
    var newPos = next.get(RiTa.POS);
    if(DBUG) console.log("    Checking: "+next+"='"+newPos+"'");
    if (!newPos || newPos !== pos)
      continue;

    // check the history =================================
    if (inHistory(next.text())) {
      if(DBUG) console.log("    Skipping (already in history):  "+next.text());
      continue;
    }

    // check the distance ================================
    var dist = Grid.yDistance(toReplace, next);
    if (dist > MAX_LINE_JUMP)
    {
      if(DBUG) console.log("    Bailing (too far to jump): "+next.text());
      next = toReplace; // too far already, give up
      break;
    }

    // check the perigrams ===============================
    var last = getLastReadCell();
    if (last)       // check perigrammer
    {
      if (!perigrams.isPerigram(last, currentCell, next)) {
        if(DBUG) console.log("    Skipping (not a perigram: '"+last+" "+currentCell+" "+next+"')");
        continue;
      }
    }

    // check the probability ============================
    var prob = .3f + (.5f - (dist/(float)(2*MAX_LINE_JUMP))); //  .3-.8
    if (Math.random() > prob) {
      if(DBUG) console.log("    Skipping (missed on prob): "+next+" [dist="+dist+" prob="+prob+"]");
      continue;
    }

    break; // return
  }

  if (tries === maxLookahead)
    Readers.warn(getClass().getName()+" failed for "+currentCell+" "+getLastReadCell());

  return print(next);
}

function print(next)
{
  // DCH: should use a ResetWordBehavior instead!
  Grid.resetTextFor(next); // added: dch 9/27 (to repair capitalizations)

  if (printToConsole)
    console.log(next.text().toUpperCase());//+"      ("+getLastReadCell()+" "+currentCell+" "+next+")");

  // check whether we add a blank line
  if (phrases) {
    if (currentCell) {

      var toCheck = currentCell.text()+" "+next.text();

      //console.log("Checking: "+toCheck);

      for (var i = 0; i < phrases.length; i++)
      {
        if (phrases[i].endsWith(toCheck)) {

         // console.log("LINE_BREAK, found: '"+toCheck+"' in '"+phrases[i]+"'");

          sendLineBreak(); // add a space between words

          if (printToConsole)
            console.log();

          break;
        }
      }
    }
    else
      console.log("LAST = null!");
  }

  return next;
}

/*LookaheadReader.prototype.textForServer = function () {

  var maxChars = 20;
  var c = selected.center();
  var pt = new Point2D.Float(c[0],c[1]);
  var relPos = (float)pt.getX() / (float)selected.getPApplet().width;
  var numSpaces = (int)(relPos * maxChars);
  var spacing = "";
  for (var i = 0; i < numSpaces; i++)
    spacing += ' ';
  var send = spacing + super.getTextForServer(selected).toUpperCase(); // TODO:
  //console.log("LAReader.sending: "+send);
  return send;
}*/

/** phrases to check for line breaks */
LookaheadReader.prototype.addPhrases(phrases) {

  this.phrases = phrases;
}

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = LookaheadReader;
}
