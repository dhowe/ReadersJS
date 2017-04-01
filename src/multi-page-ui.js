
var TEXTS = [{
  title: 'Misspelt Landings',
  file: 'data/misspeltLandings.txt',
  mesostic: 'reaching out falling through circling over landing on turning within spelling as'
}, {
  title: 'Poetic Caption',
  file: 'data/poeticCaption.txt',
  mesostic: 'reading as writing through'
}, {
  title: 'The Image',
  file: 'data/image.txt',
  mesostic: 'comes in is over goes out is done lolls in stays there is had no more'
}];

var SPEED = {
  Fluent: 0.4,
  Steady: 0.8,
  Slow: 1.2,
  Slower: 1.6,
  Slowest: 2.0,
  Fast: 0.2,
};

var STYLE = {
  Grey: 70,
  Faint: 40,
  Invisible: 0
};

var COLOR = {
  Black: 0,
  White: 255
}

var bgColor = 0;

var uiLogging = true,
  maxFocusLog = Math.floor(window.innerHeight / 30);

function createInterface() {

  Object.keys(readers).forEach(function (name) {

    var rb, readerDef = readers[name],
      reader = readerDef.reader;

    reader.hidden = readerDef.off || false;
    rb = createCheckbox(name, !reader.hidden);

    // rb.changed(readerOnOffEvent);
    rb.parent('interface');
    rb.class("reader");
    rb.id(toSafeName(name));

    readerDef.radioButton = rb;
    readerDef.speedSelect = initSelect('speedSelect', 'full', Object.keys(SPEED), speedChanged, rb);
    readerDef.speedSelect.source = reader;
    readerDef.speedSelect.value(speedToName(reader.speed));

    // onhover message
    rb.child(document.getElementById('hoverTextWrapper').cloneNode(true));
  });

  var textSelect, styleSelect, themeSelect, uiElements = [
    textSelect = initSelect('textSelect', 'full', textNames(), textChanged),
    styleSelect = initSelect('styleSelect', 'half', Object.keys(STYLE), styleChanged),
    themeSelect = initSelect('themeSelect', 'half', ['Dark', 'Light'], themeChanged),
  ];

  // set initial class
  styleSelect.value("Faint");
  var focused = pManager.focus();
  
  if (focused) {

    if (focused.hidden) {

      focused = randomReader();
      warn("Focus repair"+(focused ? ': ' + focused.type :
        " failed: "+(allReaders(true).length + " readers"))); // FIX ME
    }

    focusChanged(focused);
  }
  

  // Append elements to interface
  var descText = ['Text', 'Style', 'Theme'];
  for (var i = 0; i < uiElements.length; i++) {

    var wrapper = createDiv('');
    wrapper.addClass('item').parent('interface');
    createP(descText[i]).parent(wrapper);
    wrapper.child(uiElements[i])
  }

  var timeoutId,
    instructions = document.getElementById("instructions"),
    menu = document.getElementById("interface");

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

  function initStylizedSelect(id, style, options, onChanged, parent) { // used?

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
    }

    parent && ul.parent(parent);
    options.forEach(renderList);

    //console.log(typeof onChanged);
    ul.addEventListener("change", onChanged);

    return ul;
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

  function styleChanged() {

    var name = styleSelect.value();
    log("[UI] STYLE: " + name + "/" + STYLE[name]);

    var color = (bgColor == 0) ? COLOR.White : COLOR.Black;
    RiText.defaultFill(color, STYLE[name]); // make the default alpha accessible
    RiText.instances.forEach(function (rt) {
      //only change the opacity
      rt.alpha(STYLE[name]);
    });
  }

  function themeChanged() {

    var theme = themeSelect.value(),
      dark = (theme === "Dark");
    
    bgColor = dark ? 0 : 232;
    log("[UI] THEME: " + theme, bgColor);

    //only change the color
    var color = dark ? COLOR.White : COLOR.Black;
    var style = styleSelect.value();

    RiText.instances.forEach(function (rt) {
      rt.fill(color, STYLE[style]);
    });

    $('body').toggleClass("light", !dark);
    $('body').toggleClass("dark", dark);

    // TODO: need to change reader colors ?
  }

  function resetFocus() {

    // if only one reader is active, give it focus
    var actives = activeReaders();
    if (actives.length == 1) {

      assignFocus(actives[0]);
    }

    // if focused reader is hidden, pick a random visible
    var focused = pManager.focus();
    if (focused && focused.hidden) {
      assignFocus();
    }
    
  }

  function assignFocus(focused) {

    if (!focused) {

      var actives = activeReaders(); // pick a random reader for focus
      focused = actives.length && actives[floor(random(actives.length))];
    }

    clearFocus();

    if (focused) { // only if we have an active reader
      document.getElementById(toSafeName(nameFromReader(focused))).className += " focused";
      pManager.makeFocusedReaderVisible();
      // focusSelect.value(nameFromReader(focused)) && focusChanged();
    }

    //clear focusDisplay, change color
    $('#focusDisplay').html("");
    var c = Reader.COLORS[nameFromReader(focused).replace(/ /g,"")];
    $('#focusDisplayTag').css("color", getCSSFromColor(c));
  }

  function clearFocus() {

    var rdrs = document.getElementsByClassName("reader");
    for (var i = 0; i < rdrs.length; i++) {
      rdrs[i].className = rdrs[i].className.replace(" focused", "");
    }
  }

  function readerOnOffEvent(reader, onOffSwitch) {

    reader.hide(!onOffSwitch);
    resetFocus();

    log("[UI] " + nameFromReader(reader) + (reader.hidden ? ': Off' : ': On'));
  }

  function focusChanged(focused) {

    log("[UI] Focus: " + nameFromReader(focused));
    focused && pManager.focus(focused);

    assignFocus(focused);
  
    
  }

  function renderActiveReadersClass() {

    var rdrs = activeReaderNames();
    for (var i = 0; i < rdrs.length; i++) {
      var readerEle = document.getElementById(toSafeName(rdrs[i]));
      readerEle.className = readerEle.className.replace(" active", "");
    }
  }

  function getCSSFromColor(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
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
    if (!result) throw Error('unknown speed: ' + spd);
    return result;
  }

  function speedChanged() {

    var spd = this.value();
    this.source.speed = SPEED[spd];
    log("[UI] SPEED: " + nameFromReader(this.source)
      + '/' + this.source.speed);
  }

  function log() {

    uiLogging && console.log.apply(console, arguments);
  }

  var UI = { log: log };

  ////////////////////////////////////////////////////////////////////

  window.onresize = function () {

    // recalculate maxLog when window height changes
    maxFocusLog = Math.floor(window.innerHeight / 30);
  }

  document.getElementById('options').addEventListener('click', function () {
    if (menu.offsetHeight === 0) {
      menu.style.display = 'block';
      instructions.style.visibility = 'hidden';
      options.classList = "";

    } else {
      menu.style.display = 'none';
      instructions.style.visibility = 'visible';
      options.classList = "clear";
    }

  }, false);

  document.getElementsByTagName('body')[0].addEventListener('click', function (event) {

    if (event.pageX > 520 || event.pageY > 524)
      document.getElementById("interface").style.display = 'none';

  }, false);

  ////////////////////////////////////////////////////////////////////

  function onReaderSingleClick(ele) {

    readerOnOffEvent(readerFromName(ele.innerHTML),
      ele.parentNode.getElementsByTagName('input')[0].checked);
  }

  function onReaderDoubleClick(ele) {
     //if it is off, turn it on
    var input = ele.parentNode.children[0];
    if (input.checked) {
       readerOnOffEvent(readerFromName(ele.innerHTML), true);
       input.checked = false;
    }

    if (!ele.parentNode.matches('.focused'))
      focusChanged(readerFromName(ele.innerHTML));
  }

  menu.addEventListener('click', function (event) {

    var el = event.target;

    // differeniate single & double click for reader
    if (!el.matches('.reader label')) return;

    if (el.getAttribute("data-dblclick") == null) {
      el.setAttribute("data-dblclick", 1);
      setTimeout(function () {
        if (el.getAttribute("data-dblclick") == 1) {
          onReaderSingleClick(el);
        }
        el.removeAttribute("data-dblclick");
      }, 300);

    } else {

      el.removeAttribute("data-dblclick");
      onReaderDoubleClick(el);
    }
  })

  menu.addEventListener('click', function (event) {

    var ele = event.target;
    if (ele.matches('.hoverText a.help')) {

      var display = ele.parentNode.parentNode.getElementsByClassName("helpInfo")[0].style.display;
      display = display === "block" ? "none" : "block";
      ele.parentNode.parentNode.getElementsByClassName("helpInfo")[0].style.display = display;
    }
  })

  menu.addEventListener('mouseover', function (event) {

    var ele = event.target;
    if (ele.matches('.reader label') && !timeoutId) {
      timeoutId = window.setTimeout(function () {
        timeoutId = null;
        ele.parentNode.querySelector("#hoverTextWrapper").classList = "hover";
      }, 1000);
    }
  })

  menu.addEventListener('mouseout', function (event) {

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    var helpInfos = document.getElementsByClassName("helpInfo");
    for (var i = 0; i < helpInfos.length; i++)
      helpInfos[i].style.display = "none";
  })

} // end createInterface

////////////////////////////////////////////////////////////////////
///
function logToDisplay(msg) {

  createP(msg).parent('focusDisplay');

  //remove first element from focusDisplay
  var display = document.getElementById("focusDisplay");
  var logEntries = display.childNodes.length;

  if (logEntries > maxFocusLog) {
    while (logEntries > maxFocusLog) {
      display.removeChild(display.childNodes[0]);
      logEntries--;
    }
  }
}

$(document).ready(function () {
  $('#focusDisplayTag').click(function() {
    var tag = $('#focusDisplay:visible').length === 0 ? " - " : " + ";
    $('#focusDisplay').toggle("slide");
    $('#status').html(tag);
  })
});

////////////////////////////////////////////////////////////////////
// Customized select list : Not used yet
// var ul = document.getElementsByClassName('ul');
//   console.log(ul);
// var onSelectClicked = function () {console.log("click");}
// for (var i = 0; i < ul.length; i++)
//    ul[i].addEventListener('click', onSelectClicked, false);

$(document).ready(function () {
  $("body").on("click", "ul.select li.init", function () {
    //hide other select list if opened
    $('ul').children('li:not(.init)').hide();
    $('ul').children('li.init').show();
    $(this).closest("ul").children('li').toggle();
  });

  $("body").on("click", "ul.select li:not(.init)", function () {
    var allOptions = $("ul").children('li:not(.init)');
    allOptions.removeClass('selected');
    $(this).addClass('selected');
    $(this).closest("ul").children('.init').html($(this).html());
    $(this).closest("ul").children('li').toggle();
  });

});
