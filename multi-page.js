var DOSWITCH = false;
var pManager, font, bgColor, readers = {};

///////////////////////////////////////////////////////////////////////

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFill(styles.Faint);
  RiText.defaultFont(font, 24);
  RiText.defaults.paragraphIndent = 20;

  loadTexts(function () {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);
    pManager.layout(texts[0], 25, 40, 580, 650);

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

  background(bgColor || 0);
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

function resetText(textName) {

  Reader.pauseAll(true);
  
  pManager.layout(textFromName(textName), 25, 40, 580, 650);

  allReaders().forEach(function(r) {

    // focused reader on verso, others distributed across pages
    var idx = (r.hasFocus()) ? 0 : (r.id % Grid.instances.length);
    r.position(Grid.instances[idx], 0, 0);
  });

  Reader.pauseAll(false);
}

function allReaders(activeOnly) {
  var all = [];
  Object.keys(readers).forEach(function(name) {
    var reader = readerFromName(name);
    if (!activeOnly || !reader.hidden)
      all.push(reader);
  })
  return all;
}

function textFromName(textName) {

  var result;
  texts.forEach(function (text) {
    if (text.title == textName)
      result = text;
  });
  return result;
}

function readerFromName(name) {

  if (name && readers[name])
    return readers[name].reader;
}
