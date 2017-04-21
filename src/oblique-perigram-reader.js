///////////////////// ObliquePerigramReader /////////////////////

subclass(ObliquePerigramReader, PerigramReader);

var pathWeighting = [ .4, .5, .75, .4, 1, 1, 1, 1, 1 ];

var Direction = {
  NW: { weight: .4, int: 0 },
  N:  { weight: .5, int: 1 },
  NE: { weight: .75, int: 2 },
  W:  { weight: .4, int: 3 },
  C:  { weight: 1, int: 4 },
  E:  { weight: 1, int: 5 },
  SW: { weight: 1, int: 6 },
  S:  { weight: 1, int: 7 },
  SE: { weight: 1, int: 8 }
};

Direction.fromInt = function(i) {
  var result;
  Object.keys(this).forEach(function(d){
    if (d.int === i) result = d;
  });
  return result;
}

function ObliquePerigramReader(g, rx, ry, speed) {

  PerigramReader.call(this, g, rx, ry, speed); // superclass constructor
  this.type = 'ObliquePerigramReader'; //  superclass variable(s)

  if (!speed) this.speed = SPEED.Steady; // default speed for ObliquePerigramReaders

  this.activeFill = colorToObject(255, 0, 157, 255); // #FF009D

  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = .9;
  this.delayFactor = 1;
}

ObliquePerigramReader.prototype.onEnterCell = function (curr) {

  // console.log('Oblique onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG

  // variables needed individually for instances of perigram readers:
  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  this.innerFadeToColor = cloneColor(this.pman.defaultFill);
  this.outerFadeToColor = cloneColor(this.pman.defaultFill);
  // info("bgColor: " + bgColor);
  var invisible = this.pman.defaultFill.a == 0;
	this.innerFadeToColor.a = invisible ? 40 : 20;
	this.outerFadeToColor.a = invisible ? 95 : 0;

	this.currGrid = Grid.gridFor(curr);

  // get neighborhood
  this.neighborhood = this.currGrid.neighborhood(curr);
  this.neighborsToFade = [];
  for  (var i = 0; i < this.neighborhood.length; i++) {
    // console.log(this.neighborhood[i]);
    if (this.neighborhood[i]) {
      if (this.neighborsToFade.indexOf(this.neighborhood[i]) < 0)
        this.neighborsToFade.push(this.neighborhood[i]);
  	}
	}

  // if (this.neighborsToFade.indexOf(curr) > -1) warn("Found curr in inner neighbors."); // DEBUG

  this.outerNeighborsToFade = [];
  // get outerNeighborhood
  for (var i = 0; i < this.neighborsToFade.length; i++) {
    this.neighborhood = this.currGrid.neighborhood(this.neighborsToFade[i]);
    for (var j = 0; j < this.neighborhood.length; j++) {
      // only add unique instances
      if (this.outerNeighborsToFade.indexOf(this.neighborhood[j]) < 0) {
        this.outerNeighborsToFade.push(this.neighborhood[j]);
      }
    }
  }

  // filtering for any already active neighbors
  var i = this.outerNeighborsToFade.length;
  while (i--) {
    if (!this.outerNeighborsToFade[i] || (this.outerNeighborsToFade[i] == this.lastRead(2)) || (this.outerNeighborsToFade[i] == curr)) {
      this.outerNeighborsToFade.splice(i, 1);
      continue;
    }
		for (var j = 0; j < this.neighborsToFade.length; j++) {
			if (this.neighborsToFade[j] == this.outerNeighborsToFade[i]) {
				this.outerNeighborsToFade.splice(i, 1);
				break;
			}
		}
  }

  // also remove curr and the lastRead word from inner neighbors
  // so that it displays as faded in the color of the reader
  i = this.neighborsToFade.indexOf(curr);
  // if (i > -1) warn("Found curr in inner neighbors."); // DEBUG
  if (i > -1) this.neighborsToFade.splice(i, 1); // should not happen
  i = this.neighborsToFade.indexOf(this.lastRead(2));
  // if (i > -1) warn("Found last read word in inner neighbors."); // DEBUG - does happen
	this.neighborsToFade.splice(i, 1);

  // do the fading
  for (var i = 0; i < this.outerNeighborsToFade.length; i++) {
    this.outerNeighborsToFade[i] && this.outerNeighborsToFade[i].colorTo(this.outerFadeToColor, this.fadeInTime);
    this.outerNeighborsToFade[i] && this.outerNeighborsToFade[i].colorTo(this.pman.defaultFill, this.fadeOutTime * 2, this.delayBeforeFadeBack);
  }
  for (var i = 0; i < this.neighborsToFade.length; i++) {
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.innerFadeToColor, this.fadeInTime);
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.pman.defaultFill, this.fadeOutTime * 2, this.delayBeforeFadeBack);
  }

  // fading current in and out
  fid = curr.colorTo(this.activeFill, this.fadeInTime);
  curr.colorTo(this.pman.defaultFill, this.fadeOutTime * 2, this.delayBeforeFadeBack); // delayBeforeFadeBack
}

ObliquePerigramReader.prototype._determineReadingPath = function (last, neighbors) {

	var bestScore = 0, nextDir = -1, grid = Grid.gridFor(this.current),
  nextCell = Grid.nextCell(this.current);

  for (var directionIdx = 0; directionIdx < 9; directionIdx++)
  {
    // only try path if not null and not current or next or west
    if (neighbors[directionIdx] && (directionIdx != Grid.DIRECTION.W) && (directionIdx != Grid.DIRECTION.E) && (directionIdx != Grid.DIRECTION.C))
    {
      var newScore, USE_PERIGRAMS = false; // TODO: does not USE_PERIGRAMS
      if (USE_PERIGRAMS)
        newScore = this.tryPath(neighbors[directionIdx], pathWeighting[directionIdx], perigrams);
      else {
      	newScore = this._directionalCount(this._assembleKey(last, this.current, neighbors[directionIdx]), directionIdx) * pathWeighting[directionIdx];
      }
			// info("bestscore newScore: " + bestScore + " " + newScore); // DEBUG
      // make wayToGo the highest scoring neighbor
      if (newScore > bestScore)
      {
        bestScore = newScore;
        nextCell = neighbors[directionIdx];
        nextDir = directionIdx;
        //info(nextCell.text() + " scores: " + bestScore); // DEBUG
      }
    }
  }

  // but always go to the next or a viable SW/S/SE word 1/4 of the time:
  if ((Math.floor(Math.random() * 3) == 0) || (nextDir == -1))
  {
  	nextCell = neighbors[Grid.DIRECTION.E];
  	if (nextDir == -1) {
			nextDir = Grid.DIRECTION.E;
  	} else {
  	// info((nextDir == -1 ? "nothing viable" : "progressing on a 1 in 7 chance")); // DEBUG
  		var viableDir = false;
  		for (nextDir = 6; nextDir < 9; nextDir++) {
				if (neighbors[nextDir]) {
					var key = this._assembleKey(last, this.current, neighbors[nextDir]);
					var count = this._directionalCount(key, nextDir);
					var threshold = this._getThreshold(key);
					viableDir = this._isViableDirection(count, threshold);
				}
				if (viableDir) {
					nextCell = neighbors[nextDir];
					break;
				}
			}
			nextDir = (nextDir == 9) ? ((Math.floor(Math.random() * 3) == 0) ? Grid.DIRECTION.SE : Grid.DIRECTION.E) : nextDir;
  	}
  }
  nextCell = ((nextDir == Grid.DIRECTION.SE) && !nextCell[nextDir]) ? neighbors[Grid.DIRECTION.E] : nextCell; // got to be safe
	// info("heading: " + nextDir); // DEBUG

  if (!nextCell) Readers.error("nextCell is null!");

  // TODO: build the context based on where we are going
  // buildConTextForServer(nextCell);

  //if (printToConsole) printDirection(neighbors, nextCell, nextDir.int);

  // TODO: legacy code: setLastDirection(nextDir);

  return nextCell;
};

ObliquePerigramReader.prototype._getThreshold = function (key) {
  return key ? this._adjustForStopWords(0, key.split(' ')) : Number.MAX_SAFE_INTEGER;
};

ObliquePerigramReader.prototype._directionalCount = function (key, dir) {
  dir = dir || -1;
  return key ? this.pman.trigramCount(key) : 0;
};

ObliquePerigramReader.prototype._assembleKey = function (last, curr, neighbor) {
  var result, key, S = ' ';
  if (!last || !curr || !neighbor)
    return null;
  key = (last.text() + S + curr.text() + S + neighbor.text()).toLowerCase();
  return RiTa.stripPunctuation(key);
};

ObliquePerigramReader.prototype._isViableDirection = function (count, threshold) {
  return count > threshold;
};

// TODO: (perhaps?) this method not currently used
ObliquePerigramReader.prototype.tryPath = function (cellOnNewPath, theWeighting, perigrams) {

/* TODO: (perhaps?)
  if (perigrams) { // using perigrams
    var theScore = 0;
    if (!getLastReadCell() || !cellOnNewPath)
      return 0;
    if (perigrams.isPerigram(getLastReadCell(), this.currentCell, cellOnNewPath))
      theScore = (Math.random() < theWeighting ? 1 : 0);
    // theScore will be 0 if not a bigram
    // just give a randomly weighted score to a qualifying direction
    return theScore * (floor(random(9)) + 1);
  }
 */

  // using digrams only
  return isDigram(this.currentCell, cellOnNewPath) ?
    (random.nextDouble() < theWeighting ? 1 : 0) : 0;
}

ObliquePerigramReader.prototype.jumpToPage = function (grid)
{
  var cellToTry = grid.getRandomCell();
  while (!perigrams.isPerigram(getLastReadCell(), this.currentCell, cellToTry))
  {
    cellToTry = grid.nextCell(cellToTry);
    var g = Grid.gridFor(cellToTry);
    if (g != grid)
      cellToTry = right.cellAt(0, 0);
  }

  //console.log("Jumping with: " + getLastReadCell().text() + " " + this.currentCell.text() + " " + cellToTry.text());
  this.currentCell = cellToTry;
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = ObliquePerigramReader;
}
