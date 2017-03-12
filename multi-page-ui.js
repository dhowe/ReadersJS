
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

var speeds = {
  Fluent: 1.1,
  Steady: 1.2,
  Slow: .8,
  Slower: .7,
  Slowest: .6,
  Fast: 1.4
};

var styles = {
  Faint: 40,
  Grey: 70,
  Dark: 0
};

function createInterface() {

  Object.keys(readers).forEach(function (name) {

    var readerDef = readers[name],
      reader = readerDef.reader,
      rb = createCheckbox(name, !reader.hidden);

    rb.changed(readerOnOffEvent);
    rb.parent('interface');
    rb.class("reader");
    rb.id(toSafeName(name));

    readerDef.radioButton = rb;
    readerDef.speedSelect = initSelect("speedSelect", Object.keys(speeds), speedChanged, rb);
    readerDef.speedSelect.source = reader;
  });

  var focusSelect, textSelect, styleSelect, themeSelect, uiElements = [

    focusSelect = initSelect("focusSelect", activeReaderNames(), focusChanged),
    textSelect = initSelect("textSelect", textNames(), textChanged),
    styleSelect = initSelect("styleSelect", Object.keys(styles), styleChanged).addClass("half"),
    themeSelect = initSelect("themeSelect", ["Dark", "Light"], themeChanged).addClass("half"),
    //createButton('go').mousePressed(selectionDone).id('go')
  ];

  // set initial value for focusSelect
  focusSelect.value(nameFromReader(pManager.focus()));

  // Append elements to interface
  var descText = ["Focus", "Text", "Style", "Theme"];
  for (var i = 0; i < uiElements.length; i++) {
    var wrapper = createDiv('');
    wrapper.addClass('item').parent('interface');
    createP(descText[i]).parent(wrapper);
    uiElements[i].parent(wrapper);
  }

  ////////////////////////////////////////////////////////////////////

  function textNames() {
    var names = [];
    texts.forEach(function (text) {
      names.push(text.title);
    });
    return names;
  }

  function initSelect(id, options, onChanged, parent) {
    var sel = createSelect();
    for (var i = 0; i < options.length; i++)
      sel.option(options[i]);
    parent && sel.parent(parent);
    return sel.id(id).changed(onChanged);
  }

  function nameFromReader(reader) {
    var result = '';
    Object.keys(readers).forEach(function (name) {
      var rdr = readers[name].reader;
      if (rdr === reader) result = name;
    });
    return result;
  }

  function focusChanged() {
    var focus = readerFromName(focusSelect.value());
    console.log("[UI] FOCUS: " + focusSelect.value());
    focus && pManager.focus(focus);
    $('#focusDisplay').html("");
  }

  function textChanged() {
    var textName = textSelect.value();

    console.log("[UI] TEXT: " + textName);

    // pManager.sendUpdate(readers,texts[textName]);
  }

  function styleChanged() {
    var name = styleSelect.value(),
      alpha = styles[name];

    console.log("[UI] STYLE: " + name + "/" + alpha);

    //TODO: change text alpha - Grid?
  }

  function themeChanged() {
    var theme = themeSelect.value(),
      dark = (theme === "Dark"),
      bgColor = dark ? 0 : 232;

    console.log("[UI] THEME: " + theme);

    $('body').toggleClass("light", !dark);
    $('body').toggleClass("dark", dark);
  }

  function readerOnOffEvent() {

    var name = fromSafeName(this.id());
    var reader = readerFromName(name);
    var actives = activeReaders();
    reader.hide(!this.checked());

    console.log("[UI] READER: " + name + (reader.hidden ? ' off' : ' on'));

    resetFocus();
  }

  function resetFocus() {
    // rebuild focus options with active readers
    resetOptions(focusSelect, activeReaderNames());
    focusSelect.value(nameFromReader(pManager.focus()));

    // if only one reader is not hidden, give it focus
    var actives = activeReaders();
    if (actives.length == 1)
      assignFocus(actives[0]);

    // if focused reader is hidden, pick a random visible
    if (pManager.focus().hidden)
      assignFocus();
  }

  function assignFocus(focused) {
    if (!focused) {
      var actives = activeReaders();
      focused = actives.length && actives[Math.floor(random(actives.length))];
    }
    focusSelect.value(nameFromReader(focused)) && focusChanged();
  }

  function resetOptions(select, options) {
    for (var i = select.elt.length - 1; i >= 0; i--)
      select.elt[i].remove();

    for (var i = 0; i < options.length; i++)
      select.option(options[i]);
  }

  function activeReaderNames() {
    var actives = [];
    Object.keys(readers).forEach(function (name) {
      if (!readers[name].reader.hidden)
        actives.push(name);
    });
    return actives;
  }

  function activeReaders() {
    var active = [];
    Object.keys(readers).forEach(function (name) {
      var rdr = readers[name].reader;
      if (!rdr.hidden) active.push(rdr);
    });
    return active;
  }

  function speedFromName(name) {
    var result;
    Object.keys(speeds).forEach(function (s) {
      if (s === name) result = speeds[name];
    });
    return result;
  }

  function speedChanged() {
    var spd = this.value();
    this.source.speed = speedFromName(spd);
    console.log("[UI] SPEED: "+nameFromReader(this.source)+'/'+this.source.speed);
  }

  function toSafeName(name) {
    return name.replace(' ', '_');
  }

  function fromSafeName(name) {
    return name.replace('_', ' ');
  }

  // function selectionDone() { $('#interface').hide(); } // not used
}
