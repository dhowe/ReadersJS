///////////////////// MesosticReader /////////////////////

subclass(MesosticReader, Reader);

function MesosticReader(g, rx, ry, speed) {

		Reader.call(this,g,rx,ry,speed); // superclass constructor
		this.type = 'MesosticReader';  //  superclass variable(s)

		this.maxWordLen = Grid.maxWordLength();
		this.mesostic = "Its Over Its Done";
		this.sendLinebreak = false;
		this.upperCasing = true;
		this.letterIdx = 0;
		this.letter = null;

		this.color = [255,0,0,255];
}

var M = MesosticReader.prototype;

M.selectNext = function() {

	var letter, next = this.current,
		cf = Grid.coordsFor(this.current), lineIdx = cf.y;

	while (1) { // find the next letter

		letter = this.mesostic.charAt(this.letterIdx);

		if (++this.letterIdx == this.mesostic.length)
			this.letterIdx = 0;

		if (letter.match(/[A-Za-z]/)) { // non-punct

			if (this.letterIdx == 1)  // end-of-phrase
				this.sendLinebreak = true;

			letter = letter.toLowerCase();
			break;
		}
		else { // for punct, just send line-break

			this.sendLinebreak = true;  // a space
		}
	}

	//letter = letter.toLowerCase();

	while (1) {	// find next word containing the letter (not on the same line)

		next = Grid.nextCell(next);

		if (lineIdx == Grid.coordsFor(next).y) // ignore same line
			continue;

		if (next.text().match(letter)) {

			if (this.upperCasing) {

				next.replaceChar(next.indexOf(letter), letter.toUpperCase());
			}

			this.letter = letter;

			return next; // retun the cell
		}
	}
}

M.onEnterCell = function(curr) {

	this.fill = curr.fill();
	curr.fill(0, 0, 255);
}

M.onExitCell = function(curr) {

	curr.fill.call(curr, this.fill); // DCH: 2/2/2017
	Grid.resetCell(curr);
}

M.textForServer = function() {

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

M._pad = function(raw, c, idx) {

	var pre = raw.substring(0, idx), padStr = '';
	for (var i = 0; i < this.maxWordLen - pre.length-1; i++)
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
