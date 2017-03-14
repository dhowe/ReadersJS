var TEXTS = [{
  title: 'Misspelt Landings',
  file: 'data/misspeltLandings.txt'
}, {
  title: 'Poetic Caption',
  file: 'data/poeticCaption.txt'
}, {
  title: 'The Image',
  file: 'data/image.txt'
}];

var SPEED = {
  Fluent: 1.1,
  Steady: 1.2,
  Slow: 1.5,
  Slower: 1.8,
  Slowest: 2.2,
  Fast: .6,
};

var STYLE = {
  Faint: 40,
  Grey: 70,
  Dark: 0
};

var uiLogging = true;

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
    readerDef.speedSelect = initSelect("speedSelect", "full", Object.keys(SPEED), speedChanged, rb);
    readerDef.speedSelect.source = reader;
    readerDef.speedSelect.value(speedToName(reader.speed));
  });

  var focusSelect, textSelect, styleSelect, themeSelect, uiElements = [

    focusSelect = initSelect("focusSelect", "full", activeReaderNames(), focusChanged),
    textSelect = initSelect("textSelect",   "full", textNames(), textChanged),
    styleSelect = initSelect("styleSelect", "half", Object.keys(STYLE), styleChanged),
    themeSelect = initSelect("themeSelect", "half", ["Dark", "Light"], themeChanged),
    //createButton('go').mousePressed(selectionDone).id('go')
  ];

  // set initial value for focusSelect
  var focusedName = nameFromReader(pManager.focus()) || '';
  focusSelect.value(focusedName);
  document.getElementById(toSafeName(focusedName)).className += " focused";

  // Append elements to interface
  var descText = ["Focus", "Text", "Style", "Theme"];
  for (var i = 0; i < uiElements.length; i++) {
    var wrapper = createDiv('');
    wrapper.addClass('item').parent('interface');
    createP(descText[i]).parent(wrapper);
    wrapper.child(uiElements[i])
      // uiElements[i].parent(wrapper);
  }

  ////////////////////////////////////////////////////////////////////

  function textNames() {
    var names = [];
    TEXTS.forEach(function (text) {
      names.push(text.title);
    });
    return names;
  }

  function initSelect(id, style, options, onChanged, parent) {
    var sel = createSelect();
    for (var i = 0; i < options.length; i++)
      sel.option(options[i]);
    parent && sel.parent(parent);
    if (style === "half") sel.addClass("half");
    return sel.id(id).changed(onChanged);
  }

  function initStylizedSelect(id, style, options, onChanged, parent) {
    var ul = document.createElement('ul');
    ul.setAttribute('id', id);
    ul.setAttribute('class', "select");

    //init
    var li = document.createElement('li');
    li.setAttribute('class', "init");
    ul.appendChild(li);
    li.innerHTML = li.innerHTML + options[0];

    function renderList(element, index, arr) {
      var li = document.createElement('li');
      ul.appendChild(li);
      if (index === 0) li.setAttribute('class', "selected");
      li.innerHTML = li.innerHTML + element;
    }

    if (style === "half") {
      ul.className += " half";
    };

    parent && ul.parent(parent);
    options.forEach(renderList);
    ul.addEventListener("change", onChanged);

    return ul;
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
    log("[UI] FOCUS: " + focusSelect.value());
    focus && pManager.focus(focus);
    $('#focusDisplay').html("");
  }

  function textChanged() {
    var textName = textSelect.value();
    log("[UI] TEXT: " + textName);
    resetText(textName);
  }

  function styleChanged() {
    var name = styleSelect.value();
    log("[UI] STYLE: " + name + "/" + STYLE[name]);
    RiText.defaultFill(STYLE[name]);
    RiText.instances.forEach(function (rt) {
      rt.fill(STYLE[name]);
    });
  }

  function themeChanged() {
    var theme = themeSelect.value(),
      dark = (theme === "Dark");

    bgColor = dark ? 0 : 232;
    log("[UI] THEME: " + theme, bgColor);

    $('body').toggleClass("light", !dark);
    $('body').toggleClass("dark", dark);

    // TODO: need to change reader colors ?
  }

  function readerOnOffEvent() {
    var name = fromSafeName(this.id());
    var reader = readerFromName(name);
    var actives = activeReaders();
    reader.hide(!this.checked());
    log("[UI] READER: " + name + (reader.hidden ? ' off' : ' on'));
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
    var focused = pManager.focus();
    if (focused && focused.hidden)
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
    return allReaders(true);
  }

  function speedToName(spd) {
    var result;
    Object.keys(SPEED).forEach(function (name) {
      if (SPEED[name] === spd)
        result = name;
    });
    if (!result) throw Error('unknown speed: '+spd);
    return result;
  }

  function speedChanged() {
    var spd = this.value();
    this.source.speed = SPEED[spd];
    log("[UI] SPEED: " + nameFromReader(this.source) + '/' + this.source.speed);
  }

  function log() {
    uiLogging && console.log.apply(console, arguments);
  }

}
