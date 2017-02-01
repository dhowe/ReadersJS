///////////////////// PerigramReader /////////////////////

subclass(PerigramReader, Reader);

function PerigramReader(g, rx, ry, speed) {

	Reader.call(this,g,rx,ry,speed); // superclass constructor	
	this.type = 'PerigramReader';  //  superclass variable(s)
	
	this.consoleString = '';
	this.downWeighting = .6;
	this.upWeighting = .12;
	this.col = [255, 0, 0, 255]; // red
	this.neighborCol = [127, 0, 0, 255];
}

PerigramReader.prototype.selectNext = function() {
	
    var last =this.lastRead(2), neighbors = Grid.gridFor
    	(this.current).neighborhood(this.current);
    	
    return this._determineReadingPath(last, neighbors);
}

PerigramReader.prototype.onEnterCell = function(curr) {
	// console.log('onEnter: '+curr);
	// curr.showBounds(1); // DEBUG
	// fade in current:
	curr.colorTo(this.col,this.speed * .8);
	// get and fade in nieghborhood
	this.neighborhood = Grid.gridFor(curr).neighborhood(curr);
	for (var i = 0; i < this.neighborhood.length; i++) {
		this.neighborhood[i] && this.neighborhood[i].colorTo(this.neighborCol,this.speed * .8);
	}
}

PerigramReader.prototype.onExitCell = function(curr) {
	// console.log('onExit: '+curr);
	curr.colorTo([0,0,0,255],this.speed * .8, this.speed);
	curr.showBounds(0);
}

PerigramReader.prototype.textForServer = function() {
	
	return this.consoleString;
}
	
PerigramReader.prototype._determineReadingPath = function(last, neighbors) {

    if (!neighbors) throw Error("no neighbors");
    
    if (!this.current) throw Error("no current cell!");
        
    var NEConText, SEConText, NEViable, SEViable, NW = 0, N = 1, NE = 2, 
    	W = 3, E = 5, SW = 6, S = 7, SE = 8, wayToGo = E, conText;

	this.consoleString = '';
	      
    // only go NE if it is viable
    if (this._isViableDirection(last, this.current, neighbors[NE], NE))
    {
      wayToGo = NE;
      NEViable = true;
    }

    if (wayToGo == NE)
    {
      // collect the context in any case
      NEConText =  this.current.text() + " " + neighbors[NE].text();
      
      // but only actually go NE rarely
      wayToGo = (Math.random() < this.upWeighting) ? NE : E;
    }

    // only go SE if it is viable
    if (this._isViableDirection(last, this.current, neighbors[SE], SE)) 
    	SEViable = true;

    if (SEViable && wayToGo==E) 
    	wayToGo = SE;

    if (wayToGo == SE)
    {
      // collect the context in any case
      SEConText = this.current.text() + " " + neighbors[SE].text();
      
      // but only actually go SE occasionally
      wayToGo = (Math.random() < this.downWeighting) ? SE : E;
    }

    //this._buildConTextForServer(wayToGo, neighbors);
    conText = neighbors[wayToGo].text().replace("—", "-"); // TEMP!

    if (neighbors[wayToGo]) { 
        this.consoleString = (neighbors[wayToGo].text() + " (" +
        	Grid.direction(wayToGo)+ ") " + this.consoleString);
	}

    this.lastDirection = wayToGo;

    switch (wayToGo)
    {
      case NE: return neighbors[NE];
      
      case SE: return neighbors[SE];
      
      default: return neighbors[E] || this.current;  
    }
}

PerigramReader.prototype._isViableDirection = function(last, curr, neighbor, dir) {
	
	var result, key, S=' ', countThreshold;

    if (!last || !curr || !neighbor)
    	return false;
    	
	dir = dir || -1;
        	
	key = (last.text()+S+curr.text()+S+neighbor.text()).toLowerCase();
	key = RiTa.stripPunctuation(key);

	countThreshold = this._adjustForStopWords(0, key.split(S));
	
    result = PageManager.getInstance().isTrigram(key, countThreshold);
    
    result && (this.consoleString += "- pFound: "+key+" ("+Grid.direction(dir)+") " + countThreshold);
    
    return result;
}

PerigramReader.prototype._adjustForStopWords = function(countThreshold, words) {

    for (var i = 0; i < words.length; i++)
    {
      // order of testing is significant
      // actual stop words first (more of them with more 'semantics'
      // so they don't require as high an initial countThreshold rise)
      
      if (Reader.STOP_WORDS.indexOf(words[i])>-1)
      	countThreshold += (countThreshold < 5) ? 5 : 50;
      
      if (Reader.CLOSED_CLASS_WORDS.indexOf(words[i])>-1)
        countThreshold += (countThreshold < 10) ? 15 : 175;
    }
    
    return countThreshold;
}
  
//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node
	
	module.exports = PerigramReader;
}