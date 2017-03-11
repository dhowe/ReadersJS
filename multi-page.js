var pManager, font, bgColor = 0;
var readers = {};

///////////////////////////////////////////////////////////////////////

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFill(255, 60);
  RiText.defaultFont(font, 24);
  RiText.defaults.paragraphIndent = 20;

  loadTexts(function () {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);
    pManager.storePerigrams(3, trigrams);
    pManager.layout(textContents('The Image'), 25, 40, 580, 650);

    // add some readers
    readers['Perigram Reader'] = {
      reader: new PerigramReader(pManager.recto)
    };
    readers['Mesostic Reader'] = {
      reader: new MesosticReader(pManager.verso, 1.1)
    };

    // set page-turner/logger
    pManager.focus(readerFromName('Mesostic Reader'));

    createInterface();
  });
};

function draw() {

  background(bgColor);
  pManager && (pManager.draw());
}

function keyPressed() {

  keyCode == 39 && (pManager.nextPage());
  keyCode == 37 && (pManager.lastPage());
}

function loadTexts(callback) {

  var count = 0;
  var total = texts.length;
  texts.forEach(function (text) {
    RiTa.loadString(text.file, function (txt) {
      text.contents = txt;
      if (++count === total)
        callback();
    });
  });
}

///////////////////////////////////////////////////////////////////////

function textContents(textName) {

  var result;
  texts.forEach(function (text) {
    if (text.title == textName)
      result = text.contents;
  });
  return result;
}

function readerFromName(name) {

  if (name && readers[name])
    return readers[name].reader;
}
