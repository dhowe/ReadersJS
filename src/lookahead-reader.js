///////////////////// LookaheadReader /////////////////////

subclass(LookaheadReader, Reader);

var DBUG = true, MAX_LINE_JUMP = 5;
var phrases = [], printToConsole = true,
   allowedSubstitutions = "nn nns vb vbg vbn jj jjr jjs "; // end with space

function LookaheadReader(g, rx, ry, speed) {

  Reader.call(this, g, rx, ry, speed);
  this.type = 'LookaheadReader';
}

LookaheadReader.prototype.selectNext = function () {

  // var next = this.current,
  //   cf = Grid.coordsFor(this.current),
  //   lineIdx = cf.y;

  var tries = 0, maxLookahead = 200;
  var next = Grid.nextCell(this.current);
  var toReplace = next;

  var pos = next.get(RiTa.POS);
  if (!pos) return printIt(next);

  if (!allowedSubstitutions.indexOf(pos+" ") < 0)
    return printIt(next);

  if(DBUG) console.log("  Found pos("+pos+") "+next);

  while (tries++ < maxLookahead) {

    next = Grid.nextCell(next);

    // check the length ==================================
    if (next.length() < 2) continue;

    // match the part-of-speech ==========================
    var newPos = next.get(RiTa.POS);
    if(DBUG) console.log("    Checking: "+next+"='"+newPos+"'");
    if (!newPos || newPos !== pos)
      continue;

    // check the history =================================
    if (this.inHistory(next.text())) {
      if(DBUG) console.log("    Skipping (already in history):  "+next.text());
      continue;
    }

    // check the distance ================================
    var dist = Grid.yDist(toReplace, next);
    if (dist > MAX_LINE_JUMP) {

      if(DBUG) console.log("    Bailing (too far to jump): "+next.text());
      next = toReplace; // too far already, give up
      break;
    }

    // check the perigrams ===============================
    var last = this.lastRead();
    if (last) {      // check perigrammer

      var rts = [ last, this.current, next];
      if (!this.pman.isTrigram(rts)) {
      //if (!perigrams.isPerigram(last, currentCell, next)) {
        if(DBUG) console.log("    Skipping (not a perigram: '"+last+" "+this.current+" "+next+"')");
        continue;
      }
    }

    // check the probability ============================
    var prob = .3 + (.5 - (dist/(2*MAX_LINE_JUMP))); //  .3-.8
    if (Math.random() > prob) {
      if(DBUG) console.log("    Skipping (missed on prob): "+next+" [dist="+dist+" prob="+prob+"]");
      continue;
    }

    break; // return
  }

  if (tries === maxLookahead)
    Readers.warn(this.type+" failed for "+this.current+" "+lastRead());

  return printIt(next);
}

function printIt(next) {

  // DCH: should use a ResetWordBehavior instead!
  Grid.resetCell(next); // added: dch 9/27 (to repair capitalizations)

  if (printToConsole)
    console.log(next.text().toUpperCase());//+"      ("+this.lastRead()+" "+this.current+" "+next+")");

  // check whether we add a blank line
  if (phrases) {

    if (this.current) {

      var toCheck = this.current.text()+" "+next.text();

      //console.log("Checking: "+toCheck);

      for (var i = 0; i < phrases.length; i++) {

        if (phrases[i].endsWith(toCheck)) {

         // console.log("LINE_BREAK, found: '"+toCheck+"' in '"+phrases[i]+"'");

          this.sendLinebreak = true;

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
  var relPos = pt.getX() / selected.getPApplet().width;
  var numSpaces = parseInt(relPos * maxChars);
  var spacing = "";
  for (var i = 0; i < numSpaces; i++)
    spacing += ' ';
  var send = spacing + super.getTextForServer(selected).toUpperCase(); // TODO:
  //console.log("LAReader.sending: "+send);
  return send;
}*/

/** phrases to check for line breaks */
LookaheadReader.prototype.addPhrases = function(phrases) {

  this.phrases = phrases;
}

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = LookaheadReader;
}
