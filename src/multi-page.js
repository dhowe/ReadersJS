var pManager, font, bgColor, disabled = true, readers = {};

///////////////////////////////////////////////////////////////////////

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFont(font, 24);
  RiText.defaultFill(COLOR.White, STYLE.Faint);
  RiText.defaults.paragraphIndent = 20;

  loadTexts(function () {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);
    pManager.layout(TEXTS[0], 25, 40, 580, 650);

    new PerigramReader(pManager.recto, SPEED.Fluent);
    new MesosticReader(pManager.verso);
    new ObliquePerigramReader(pManager.verso);
    new SpawningSimpleReader(pManager.recto);
    new SpawningPerigramReader(pManager.verso);
    /* add some readers
    readers['Perigram Reader'] = {
      reader: new PerigramReader(pManager.recto, SPEED.Fluent),
      off: 0
    };

    readers['Mesostic Reader'] = {
      reader: new MesosticReader(pManager.verso),
      off: 0
    };

    readers['Oblique Perigram Reader'] = {
      reader: new ObliquePerigramReader(pManager.verso),
      off: 0
    };

    readers['Spawning Simple Reader'] = {
      reader: new SpawningSimpleReader(pManager.recto),
      off: 0
    };

    readers['Spawning Perigram Reader'] = {
      reader: new SpawningPerigramReader(pManager.verso),
      off: 0
    };*/

    pManager.focus(randomReader());

    createInterface();
  });
};

function draw() {

  background(bgColor || 0);
  pManager && (pManager.draw());
}

function keyPressed() {

  keyCode == 39 && (pManager.nextPage(1));
  keyCode == 37 && (pManager.lastPage(1));

  if (key === 'R') dumpMem(); // DEBUG: (PRESS 'r' FOR CONSOLE OUTPUT)
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
  Reader.findByType('OnewayPerigramReader').forEach(Reader.dispose);

  var textObj = textFromName(textName);
  pManager.layout(textObj, 25, 40, 580, 650);

  allReaders().forEach(function (r) {

    // focused reader on verso, others distributed across pages
    var idx = (r.hasFocus()) ? 0 : (r.id % Grid.instances.length);
    r.position(Grid.instances[idx], 0, 0);
  });

  var meso = readerFromName('Mesostic Reader');
  meso && (meso.mesostic = textObj.mesostic);

  Reader.pauseAll(false);
}

function allReaders(activeOnly) {

  var all = []; // use filter
  for (var i = 0; i < Reader.instances.length; i++) {
    if (!activeOnly || !Reader.instances[i].hidden)
      all.push(Reader.instances[i]);
  }
  return all;
}

function allReadersOld(activeOnly) {

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
  for (var i = 0; i < Reader.instances.length; i++) {
    if (name === Reader.instances[i].type)
      return Reader.instances[i];
  }
}

function readerFromNameOld(name) {

  if (name && readers[name])
    return readers[name].reader;
}

// function nameFromReader(reader) {
//
//   var result = '';
//   Object.keys(readers).forEach(function (name) {
//     var rdr = readers[name].reader;
//     if (rdr === reader) result = name;
//   });
//
//   return result;
// }

function textChanged() {

  var e = document.getElementById('textSelect'),
    textName = e.options[e.selectedIndex].value;

  log("[UI] TEXT: " + textName);

  if (ifTrigramReady(textName)) {

    resetText(textName);

  } else {

    notify = textName;
    overlay.classList.toggle('fade');
  }

  $('#focusDisplay').html("");

  // hide the menu
  document.getElementById("interface").style.display = 'none';
}

function colorToArray(obj, overrideAlpha) { // takes optional 2nd argument for alpha

  return [obj.r, obj.g, obj.b, (typeof overrideAlpha === 'undefined')
    ? obj.a || 255 : overrideAlpha];
}

function cloneColor(obj) {

  return {
    r: obj.r,
    g: obj.g,
    b: obj.b,
    a: obj.a
  };
}

function ifTrigramReady(textName) {

  if (textLoaded.indexOf(textName) != -1) {
    //log("[Check Trigram] true", textName);
    return true;
  } else {
    //log("[Check Trigram] false");
    notify = textName;
    return false;
  }
}

function dumpMem() {

  var stats = {}, ids = [];
  for (var i = 0; i < Reader.instances.length; i++) {
    ids.push(Reader.instances[i].id + "/" + (Reader.instances[i].freeCount || '-'));
    if (!stats[Reader.instances[i].type])
      stats[Reader.instances[i].type] = 0;
    stats[Reader.instances[i].type]++;
  }
  console.log("[MEM] Count:", Reader.instances.length, stats, ids);
}
