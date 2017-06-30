p5.disableFriendlyErrors = true; // opt

var pManager, font, bgColor, fps = false;

function preload() {

  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFont(font, 24);
  RiText.defaults.paragraphLeading = 10;
  RiText.defaults.paragraphIndent = 0;

  loadTexts(function() {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);

    pManager.layout(TEXTS[0], 25, 40, 580, 650);
    pManager.gridFill(colorToObject(255, 255, 255, 40));

    // add some readers
    new PerigramReader(pManager.recto, SPEED.Fluent);
    //new MesosticJumper(pManager.verso).hide(0);
    new MesosticReader(pManager.verso);
    new ObliquePerigramReader(pManager.verso);
    new SpawningSimpleReader(pManager.recto);
    new SpawningPerigramReader(pManager.verso);

    // pick one to get focus
    pManager.focus(randomReader());

    createInterface();
  });
}

function draw() {

  background(bgColor || 0);
  pManager && (pManager.draw());
  if (fps) {
    fill(255);
    textSize(14);
    text(round(frameRate()), width-20,15);
  }
}

function keyPressed() {

  keyCode == 39 && (pManager.nextPage(1));
  keyCode == 37 && (pManager.lastPage(1));

  if (key === 'R') dumpMem(); // DEBUG: (PRESS 'r' FOR CONSOLE OUTPUT)
  if (key === 'F') toggleFPS(); // DEBUG: (PRESS 'f' FOR FRAME RATE)
  if (key === ' ') togglePaused(); // DEBUG: (PRESS ' ' TO PAUSE)
}

function togglePaused() {
  var state;
  Reader.instances.forEach(function (r) { // fix to #152 (was only active readers
    r.paused = !r.paused;
    state = r.paused;
  });
  console.log('[UI] paused='+state);
}


function loadTexts(callback) {

  var count = 0, total = TEXTS.length;

  $.get("package.json", function(json) {
      console.log('[INFO] Readers.version ['+json.version+']');
  });

  TEXTS.forEach(function (text) {
    RiTa.loadString(text.file, function (txt) {
      text.contents = txt;
      if (++count === total)
        loadTrigrams(callback);
    });
  });
}

///////////////////////////////////////////////////////////////////////

function resetText(textName) {

  Reader.pauseAll(true);
  Reader.findByType('OnewayPerigramReader').forEach(Reader.dispose);

  var textObj = textFromName(textName);
  pManager.layout(textObj, 25, 40, 580, 650);

  Reader.instances.forEach(function (r) {
    r.history = []; // reset state
    // focused reader on verso, others distributed across pages
    var idx = (r.hasFocus()) ? 0 : (r.id % Grid.instances.length);
    r.position(Grid.instances[idx], 0, 0);
  });

  Reader.findByType(['MesosticReader', 'MesosticJumper'])
    .forEach(function(m) {
      m.setMesostic(textObj.mesostic); // new mesostic
    });

  themeChanged();
  Reader.pauseAll(false);
}

function activeReaders() {
  return Reader.instances.filter(function (r) {
    return (!r.hidden && r.type !== 'OnewayPerigramReader')
  });
}

function randomReader() {

  var rdrs = activeReaders();
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

function themeChanged() {

  var e1 = document.getElementById('styleSelect'),
      e2 = document.getElementById('themeSelect');

  if (e1 === null || e2 === null) return;

  var styleName = e1.options[e1.selectedIndex].value,
      themeName = e2.options[e2.selectedIndex].value;

  var dark = (themeName === "Dark"),
    style = STYLE[styleName],
    col = dark ? COLOR.White : COLOR.Black;


  $('body').toggleClass("light", !dark).toggleClass("dark", dark);
  bgColor = dark ? 0 : 232; // global
  pManager.gridFill(colorToObject(col, style));
  changeReadersColorTheme(dark);

  //focus
  $('#focusDisplayTag').css("color", getCSSFromColor(pManager.focus().activeFill));

  log("[UI] Theme/style: " + themeName + "/" + styleName);
}

function changeReadersColorTheme(isDark) {
  activeReaders().forEach(function(r) {
    r.activeFill = isDark ? r.defaultColorDark : r.defaultColorLight;
  });
}

function textChanged() {

  $('#focusDisplay').html("");
  // hide the menu
  document.getElementById("interface").style.display = 'none';

  var e = document.getElementById('textSelect'),
    textName = e.options[e.selectedIndex].value;

  var trigramsReady = function (textName) {

    if (textLoaded.indexOf(textName) != -1) {

      log("[Check Trigram] true", textName);
      return true;

    } else {

      log("[Check Trigram] false");
      notify = textName;
      return false;
    }
  }

  log("[UI] TEXT: " + textName);

  if (trigramsReady(textName)) {

    resetText(textName);

  } else {

    notify = textName;
    overlay.classList.toggle('fade');
  }

}

function colorToArray(obj, overrideAlpha) { // takes optional 2nd argument for alpha

  return [obj.r, obj.g, obj.b, (typeof overrideAlpha === 'undefined') ?
    obj.a || 255 : overrideAlpha
  ];
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorToObject(r, g, b, a) {

  if (arguments.length === 1) {
    if (r.length) {
      a = arguments[3];
      b = arguments[2];
      g = arguments[1];
      r = arguments[0];
    } else {
      a = 255;
      b = arguments[0];
      g = arguments[0];
      r = arguments[0];
    }
  } else if (arguments.length === 2) {
    a = arguments[1];
    b = arguments[0];
    g = arguments[0];
    r = arguments[0];
  }
  return {
    r: r,
    g: g,
    b: b,
    a: typeof a !== 'undefined' ? a : 255
  };
}

function cloneColor(obj) {

  return {
    r: obj.r,
    g: obj.g,
    b: obj.b,
    a: obj.a
  };
}

function toggleFPS() {
  fps = !fps;
}

function dumpMem() {

  var stats = {},
    ids = [];
  for (var i = 0; i < Reader.instances.length; i++) {
    ids.push(Reader.instances[i].id + "/" + (Reader.instances[i].freeCount || '-'));
    if (!stats[Reader.instances[i].type])
      stats[Reader.instances[i].type] = 0;
    stats[Reader.instances[i].type]++;
  }
  console.log("[MEM] Count:", Reader.instances.length, stats, ids);
}
