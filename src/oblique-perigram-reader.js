///////////////////// ObliquePerigramReader /////////////////////

subclass(ObliquePerigramReader, PerigramReader);

var Direction = {
  NW: { weight: 1, int: 0 },
  N:  { weight: 1, int: 1 },
  NE: { weight: 1, int: 2 },
  W:  { weight: 1, int: 3 },
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

  this.fill = RiText.defaultFill(); // or another color?
  if (!speed) this.speed = SPEED.Steady; // default speed for ObliquePerigramReaders

  //Perigram Reader Color
  this.col = Reader.COLORS[this.type]; // red


  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 2;
  this.delayFactor = 2;

}

ObliquePerigramReader.prototype.onEnterCell = function (curr) {

  // console.log('Oblique onEnter: '+ curr.text() + " " + this.speed + " " + this.stepTime);
  // curr.showBounds(1); // DEBUG

  // variables needed individually for instances of perigram readers:
  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  this.gridColor = RiText.defaultFill();
  this.innerFadeToColor = colorToArray(this.gridColor);
  this.outerFadeToColor = colorToArray(this.gridColor);
  this.innerFadeToColor[3] = this.innerFadeToColor[3] / 2; // halve the alpha of the grid for inner circle
  this.outerFadeToColor[3] = 0; // and make outer circle transparent (here: black against black background)

  // fading current in and out
  fid = curr.colorTo(this.col, this.fadeInTime);
  curr.colorTo(this.gridColor, this.fadeOutTime, this.delayBeforeFadeBack);

  // get neighborhood
  this.neighborhood = Grid.gridFor(curr).neighborhood(curr);
  this.neighborsToFade = [];
  for  (var i = 0; i < this.neighborhood.length; i++) {
    // console.log(this.neighborhood[i]);
    if (this.neighborhood[i]) {
            if (this.neighborsToFade.indexOf(this.neighborhood[i]) < 0) this.neighborsToFade.push(this.neighborhood[i]);
  	}
	}

  this.outerNeighborsToFade = [];
  // get outerNeighborhood
  for (var i = 0; i < this.neighborsToFade.length; i++) {
    this.neighborhood = Grid.gridFor(curr).neighborhood(this.neighborsToFade[i]);
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
    if (!this.outerNeighborsToFade[i] || (this.outerNeighborsToFade[i] == curr) || (this.outerNeighborsToFade[i] == this.lastRead(2))) {
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

  // also remove the lastRead word from inner neighbors
  // so that it displays as faded in the color of the reader
  i = this.neighborsToFade.indexOf(this.lastRead(2));
  this.neighborsToFade.splice(i, 1);

  // do the fading
  for (var i = 0; i < this.neighborsToFade.length; i++) {
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.innerFadeToColor, this.fadeInTime);
    this.neighborsToFade[i] && this.neighborsToFade[i].colorTo(this.gridColor, this.fadeOutTime, this.delayBeforeFadeBack);
  }
  for (var i = 0; i < this.outerNeighborsToFade.length; i++) {
    this.outerNeighborsToFade[i] && this.outerNeighborsToFade[i].colorTo(this.outerFadeToColor, this.fadeInTime);
    this.outerNeighborsToFade[i] && this.outerNeighborsToFade[i].colorTo(this.gridColor, this.fadeOutTime, this.delayBeforeFadeBack);
  }
}

ObliquePerigramReader.prototype.determineReadingPath = function (neighbors) {

  var bestScore = 0, nextDir = E, grid = Grid.gridFor(this.current),
    nextCell = grid.nextCell(this.current);

  for (var idx = 0; idx < 9; idx++)
  {
    // only try path if not null and not current or next
    if (idx != C.int && idx != E.int && neighbors[idx])
    {
      var newScore;
      if (USE_PERIGRAMS)
        newScore = tryPath(neighbors[idx], pathWeighting[idx], perigrams);
      else
        newScore = tryPath(neighbors[idx], pathWeighting[idx]);

      // make wayToGo the highest scoring neighbor
      if (newScore > bestScore)
      {
        bestScore = newScore;
        nextCell = neighbors[idx];
        nextDir = Direction.fromInt(idx);
      }
    }
  }

  // but always go to the next word 1/7 of the time:
  if (floor(random(7)) == 0)
  {
    nextCell = grid.nextCell(this.currentCell);
    nextDir = E;
  }

  if (!nextCell) Readers.error("nextCell is null!");

  // build the context based on where we are going
  // buildConTextForServer(nextCell);

  //if (printToConsole) printDirection(neighbors, nextCell, nextDir.int);

  setLastDirection(nextDir);

  return nextCell;
};

ObliquePerigramReader.prototype.tryPath = function (cellOnNewPath, theWeighting, perigrams) {

  if (perigrams) { // using perigrams

    var theScore = 0;

    // theWeighting (from pathWeighting[]) not yet used
    if (!getLastReadCell() || !cellOnNewPath)
      return 0;

    if (perigrams.isPerigram(getLastReadCell(), this.currentCell, cellOnNewPath))
      theScore = (Math.random() < theWeighting ? 1 : 0);

    // theScore will be 0 if not a bigram
    // just give a randomly weighted score to a qualifying direction
    return theScore * (floor(random(9)) + 1);
  }

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
