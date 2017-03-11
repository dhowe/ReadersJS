var texts = [{
    title: 'The Image',
    file: 'data/image.txt'
  }, {
    title: 'Poetic Caption',
    file: 'data/poeticCaption.txt'
  }, {
    title: 'Misspelt Landings',
    file: 'data/misspeltLandings.txt'
  }];

var speeds = ["Fluent", "Steady", "Slow", "Slower", "Slowest", "Fast"];
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
    pManager.layout(texts[0].contents, 25, 40, 580, 650);

    // add some readers
    readers['Perigram Reader'] = {
      reader: new PerigramReader(pManager.recto)
    };
    readers['Mesostic Reader'] = {
      reader: new MesosticReader(pManager.verso, 1.1)
    };

    // set page-turner/logger
    pManager.focus(readers['Mesostic Reader'].reader);

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

///////////////////////////////////////////////////////////////////////

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

function toSafeName(name) {
  return name.replace(' ','_');
}

function fromSafeName(name) {
  return name.replace('_',' ');
}

function createInterface() {

  Object.keys(readers).forEach(function (name) {

    var readerDef = readers[name],
      reader = readerDef.reader,
      rb = createCheckbox(name, status);

    rb.changed(readerOnOffEvent);
    rb.parent('interface');
    rb.class("reader");
    rb.id(toSafeName(name));

    readerDef.active = true;
    readerDef.radioButton = rb;
    readerDef.speedSelect = initializeSelect("speedSelect", speeds, speedChanged).parent(rb);
  });

  var interfaceElements = [

    initializeSelect("focusSelect", Object.keys(readers), focusChanged),
    initializeSelect("textSelect", textNames(), textChanged),
    initializeSelect("styleSelect", ["Faint", "Grey", "Dark"], styleChanged).addClass("half"),
    initializeSelect("themeSelect", ["Dark", "Light"], themeChanged).addClass("half"),
    createButton('go').mousePressed(selectionDone).id('go')
  ];

  // Append elements to interface
  var descText = ["Focus", "Text", "Style", "Theme"];
  for (var i = 0; i < interfaceElements.length; i++) {

    if (i != interfaceElements.length - 1) {

      var wrapper = createDiv('');
      wrapper.addClass('item').parent('interface');
      createP(descText[i]).parent(wrapper);
      interfaceElements[i].parent(wrapper);

    } else {

      interfaceElements[i].parent('interface');
    }
  }

  // set initial value for focusSelect
  var fr = nameFromReader(pManager.focus());
  console.log(pManager.focus());

  console.log(fr);
  $('#focusSelect').val(fr);
}

// function toSafeName(name) {
//   return name.replace(" ")
// }
//
// function fromSafeName(name) {
//   return name.replace(" ")
// }

function nameFromReader(reader) {

  var result;
  Object.keys(readers).forEach(function (name) {
    var rdr = readers[name].reader;
    if (rdr === reader)
      result = name;
  });
  return result;
}

function readerFromName(name) {

  Object.keys(readers).forEach(function (n) {
    if (n === name)
      return readers[name].reader;
  });
}

function textContentsFromName(name) {

  texts.forEach(function (text) {
    if (text.title == name)
      return text.contents;
  });
}

function textNames() {

  var names = [];
  texts.forEach(function (text) {
    names.push(text.title);
  });
  return names;
}

function initializeSelect(id, options, onChanged) {

  console.log('initializeSelect:', id, options, typeof onChanged);
  var sel = createSelect();
  for (var i = 0; i < options.length; i++)
    sel.option(options[i]);
  return sel.id(id).changed(onChanged);
}

function focusChanged() {

  console.log("CHANGE FOCUS TO:" + focusSelect.value());
  var focus = getReadersFromName(focusSelect.value());
  pManager.focus(focus);
  //clear focusDisplay
  $('#focusDisplay').html("");
}

function textChanged() {

  //var textName = textSelect.value().replace(" ", "");
  var textName = textSelect.value();
  console.log("CHANGE TEXT TO:" + textName);
  // pManager.sendUpdate(readers,texts[textName]);
}

function styleChanged() {

  var style = styleSelect.value();

  var alpha;
  switch (style) {
  case "Faint":
    alpha = 40;
  case "Grey":
    alpha = 70;
  case "Dark":
    alpha = 0;
  }
  console.log(style, alpha);

  //TODO: change text alpha - Grid?
}

function themeChanged() {

  var theme = themeSelect.value();
  if (theme === "Dark") {
    bgColor = 0;
    $('body').addClass("dark");
    $('body').removeClass("light");
    //TODO: change default font color to white

  } else {
    bgColor = 232;
    $('body').addClass("light");
    $('body').removeClass("dark");
    //TODO: change default font color to black
  }

}

function readerOnOffEvent() {
  console.log(this.parent().id, this.checked());
  //TODO: remove/add to readers
}

function speedChanged() {
  console.log(this.parent().id);
  //TODO: change the speed of corresponding reader
}

function selectionDone() {
  $('#interface').hide();
}
