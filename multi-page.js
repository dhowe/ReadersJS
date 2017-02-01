/*
 * OPTIONS FOR HOW TO RUN THIS:
 * 	1) APP
 *  2) CLIENT
 *  3) SERVER
 *
 * NEXT:
 * 	JC: Fading for PerigramReader
 *  DH: Fix FF font-bug
 *  DH: Spacing for caps in MesosticReader
 */
var pManager, rdr, textFile = 'data/image.txt', mode = 1; // for app, 2 client

if (typeof module !== 'undefined') nodeImports();

function __setup() {

	RiTa.loadString(textFile, function(txt) {

		// fonts/defaults
		RiText.defaultFont(times17);
		RiText.defaults.paragraphIndent = 20;

		// do the layout
		pManager = PageManager.getInstance(Reader.APP);
		pManager.storePerigrams(3, trigrams);
		pManager.layout(txt, 25, 40, 400, 400);  // grid-rect

		// add some readers
		rdr = new Reader(pManager.recto, 1, 8, .4);
		//rdr = new PerigramReader(pManager.recto);
		//rdr = new MesosticReader(pManager.verso, 1.1);

		// set page-turner/logger
		pManager.focus(rdr);
	});
}

////////////////////////////////////////////////////////////////////////

function __draw() {

	pManager && (pManager.draw());
}

function __keyPressed(code) {

	code == 39 && (pManager.nextPage());
	code == 37 && (pManager.lastPage());
}

///////////////////////////////// node //////////////////////////////////

function nodeImports() {

	// required libs/files for node
	RiString = require('./lib/rita').RiString,
		RiText = require('./lib/ritext').RiText,
		Readers = require('./src/readers-app'),
		Grid = Readers.Grid, Reader = Readers.Reader,
		PageManager = Readers.PageManager,
		MesosticReader = require('./src/mesostic-reader'),
		PerigramReader = require('./src/perigram-reader')
		times17 = require('./fonts/times17'),
		trigrams = require('./data/image-perigrams');
		//postags = require('./data/image-pos');

	if (inNode()) require('./readers-server');

	io = require('socket.io-client');

	_setup();
}
