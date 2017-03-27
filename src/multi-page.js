var pManager, font, bgColor, disabled = true, readers = {};

///////////////////////////////////////////////////////////////////////

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
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

    // add some readers
    readers['Perigram Reader'] = {
      reader: new PerigramReader(pManager.recto, SPEED.Fluent),
      off: true
    };

    readers['Mesostic Reader'] = {
      reader: new MesosticReader(pManager.verso, SPEED.Steady),
      off: true
    };

    readers['Oblique Perigram Reader'] = {
      reader: new ObliquePerigramReader(pManager.verso, SPEED.Steady),
      off: true
    };

    readers['Spawning Simple Reader'] = {
      reader: new SpawningSimpleReader(pManager.recto, 5, 16, SPEED.Steady),
      off: false
    };

    readers['Spawning Perigram Reader'] = {
      reader: new SpawningPerigramReader(pManager.verso, SPEED.Steady),
      off: true
    };

    pManager.focus(randomReader());

    createInterface();
  });
};

function draw() {

  background(bgColor || 0);
  pManager && (pManager.draw());
  //console.log(Reader.instances.length);
}

function keyPressed() {

  keyCode == 39 && (pManager.nextPage(1));
  keyCode == 37 && (pManager.lastPage(1));

  if (key === 'R') { // MEMORY DEBUGGING (PRESS 'r' FOR CONSOLE OUTPUT)
    var stats = {}, ids = [];
    for (var i = 0; i < Reader.instances.length; i++) {
      ids.push(Reader.instances[i].id + "/" + (Reader.instances[i].freeCount || '-'));
      if (!stats[Reader.instances[i].type])
        stats[Reader.instances[i].type] = 0;
      stats[Reader.instances[i].type]++;
    }
    console.log("[MEM] Count:", Reader.instances.length, stats, ids);
  }
}

function loadTexts(callback) {

  var count = 0;
  var total = TEXTS.length;
  TEXTS.forEach(function (text) {
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

  allReaders().forEach(function (r) {

    // focused reader on verso, others distributed across pages
    var idx = (r.hasFocus()) ? 0 : (r.id % Grid.instances.length);
    r.position(Grid.instances[idx], 0, 0);
  });

  Reader.pauseAll(false);
}

function allReaders(activeOnly) {

  var all = [];
  Object.keys(readers).forEach(function (name) {
    var reader = readerFromName(name);
    //console.log(reader.type,reader.hidden);
    if (!activeOnly || !reader.hidden)
      all.push(reader);
  })
  return all;
}

function randomReader() {

  var rdrs = allReaders(true);
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

function nameFromReader(reader) {

  var result = '';
  Object.keys(readers).forEach(function (name) {
    var rdr = readers[name].reader;
    if (rdr === reader) result = name;
  });

  return result;
}

function textChanged() {

  var e = document.getElementById('textSelect')
  var textName = e.options[e.selectedIndex].value;
  log("[UI] TEXT: " + textName);

  if (ifTrigramReady(textName)) {

    resetText(textName);

  } else {

    notify = textName;
    overlay.classList.toggle('fade');
  }
}

function ifTrigramReady(textName) {

  if (textLoaded.indexOf(textName) != -1) {
    log("[Check Trigram] true", textName);
    return true;
  } else {
    log("[Check Trigram] false");
    notify = textName;
    return false;
  }
}
