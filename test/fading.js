var pManager, font, bgColor, readers = {};


///////////////////////////////////////////////////////////////////////

function test() {

  var stone = pManager.verso.cellAt(6,3);
  //console.log(stone);
  stone.fill([255,0,0,255]);

  //var st = millis();
  stone.colorTo([100,100,100,255], 2);
  stone.colorTo([100,0,255,255],1, 1);

  // pManager.verso.cellAt(7,3).fill(0,0,255);

  // setInterval(function() {
  //     var el = millis() - st;
  //     if (0&&el < 4000) console.log(floor(stone.fill().r)+"\t\t"+(floor(el/100)/10)+'s');
  //   }, 100);
}

///////////////////////////////////////////////////////////////////////


function preload() {

  font = loadFont('../fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFont(font, 24);
  RiText.defaultFill(STYLE.Grey);
  RiText.defaults.paragraphIndent = 20;

  loadTexts(function () {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);
    pManager.layout(TEXTS[0], 25, 40, 580, 650);
    // for (var i = 0; i < RiText.instances.length; i++) {
    //   console.log(RiText.instances[i].text(), RiText.instances[i]._color);
    // }
    test();
  });
};

function draw() {

  background(bgColor || 0);
  pManager && (pManager.draw());
}

function loadTexts(callback) {
  var count = 0;
  var total = TEXTS.length;
  TEXTS.forEach(function (text) {
    RiTa.loadString('../'+text.file, function (txt) {
      text.contents = txt;
      if (++count === total)
        callback(txt);
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

function randomReader(activeOnly) {

  var rdrs = allReaders(activeOnly);
  if (rdrs && rdrs.length) {
    return rdrs[Math.floor(random(rdrs.length))];
  }
}

function textFromName(textName) {

  var result;
  TEXTS.forEach(function (text) {
    if (text.title == textName)
      result = text;
  });
  return result;
}

function readerFromName(name) {

  if (name && readers[name])
    return readers[name].reader;
}

function textChanged() {
    var textName = textSelect.value();
    log("[UI] TEXT: " + textName);
    if ( ifTrigramReady(textName) )
       resetText(textName);
    else {
      notify = textName;
      overlay.classList.toggle('fade');

    }
}
