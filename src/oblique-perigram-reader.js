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
  buildConTextForServer(nextCell);

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

ObliquePerigramReader.prototype.buildConTextForServer = function (wayToGo)
{
  var spacing = "      ",
    text = wayToGo ? wayToGo.text() : "";
  conText = spacing + text;
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