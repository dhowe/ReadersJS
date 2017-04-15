// Interface options (for texts, see src/text-loader.js)

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

var bgColor = 0,
  uiLogging = true,
  maxFocusLog = Math.floor(window.innerHeight / 30);

function createInterface() {

  Reader.instances.forEach(function (reader) {

    var rb = createCheckbox(reader.name(), !reader.hidden);
    rb.parent('interface');
    rb.class("reader");
    rb.id(reader.type);

    var speedSelect = initSelect('speedSelect', 'full', Object.keys(SPEED), speedChanged, rb);
    speedSelect.value(speedToName(reader.speed));
    speedSelect.source = reader;

    rb.child(document.getElementById('hoverTextWrapper').cloneNode(true)); // onhover message
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
      warn("Focus repair" + (focused ? ': ' + focused.type :
        " failed: " + (activeReaders().length + " readers"))); // FIX ME
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

  function styleChanged() {

    var col = (bgColor == 0) ? COLOR.White : COLOR.Black,
      name = styleSelect.value(),
      style = STYLE[name];
    log("[UI] Style: " + name + "/" + style);
    //pManager.gridAlpha(style);
    pManager.gridFill(colorToObject(col, style));
  }

  function themeChanged() {

    var theme = themeSelect.value(),
      dark = (theme === "Dark"),
      style = STYLE[styleSelect.value()],
      col = dark ? COLOR.White : COLOR.Black;

    bgColor = dark ? 0 : 232; // global

    log("[UI] Theme: " + theme);

    pManager.gridFill(colorToObject(col, style));

    $('body').toggleClass("light", !dark).toggleClass("dark", dark);
  }

  function resetFocus() {

    var focused = pManager.focus(),
      actives = activeReaders();

    // if only one reader is active and its not focused, give it focus
    if (actives.length == 1 && actives[0] !== focused) {
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

      document.getElementById(focused.type).className += " focused";
      pManager.focus(focused);
      pManager.makeFocusedReaderVisible();
    }

    // clear focusDisplay, change color
    $('#focusDisplay').html('');
    $('#focusDisplayTag').css("color", getCSSFromColor(focused.activeFill));
  }

  function clearFocus() {

    var rdrs = document.getElementsByClassName("reader");
    for (var i = 0; i < rdrs.length; i++) {
      rdrs[i].className = rdrs[i].className.replace(" focused", '');
    }
  }

  function readerOnOffEvent(reader, onOffSwitch) {

    reader.hide(!onOffSwitch);
    resetFocus();

    log("[UI] " + reader.type + (reader.hidden ? ': Off' : ': On'));
  }

  function focusChanged(focused) {

    log("[UI] Focus: " + focused.type);
    focused && pManager.focus(focused);
    assignFocus(focused);
  }

  function getCSSFromColor(colorObj) {
    return "rgb(" + colorObj.r + "," + colorObj.g + "," + colorObj.b + ")";
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
    log('[UI] ' + this.source.type + '.speed=' + this.source.speed);
  }

  function log() {
    uiLogging && console.log.apply(console, arguments);
  }

  ////////////////////////////////////////////////////////////////////

  window.onresize = function () {

    // recalculate maxLog when window height changes
    maxFocusLog = Math.floor(window.innerHeight / 30);
  }

  document.getElementById('options').addEventListener('click', function () {

    if (menu.offsetHeight === 0) {
      menu.style.display = 'block';
      instructions.style.visibility = 'hidden';
      options.classList = '';

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

    readerOnOffEvent(Reader.firstOfType(ele.parentNode.id),
      ele.parentNode.getElementsByTagName('input')[0].checked);
  }

  function onReaderDoubleClick(ele) {
    //if it is off, turn it on
    var input = ele.parentNode.children[0];
    if (input.checked) {
      readerOnOffEvent(Reader.firstOfType(ele.parentNode.id), true);
      input.checked = false;
    }

    if (!ele.parentNode.matches('.focused'))
      focusChanged(Reader.firstOfType(ele.parentNode.id));
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

function focusJump(focused) {

  $('#focusDisplay').html('');
}

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

  $('#focusDisplayTag').click(function () {
    var tag = $('#focusDisplay:visible').length === 0 ? " - " : " + ";
    $('#focusDisplay').toggle("slide");
    $('#status').html(tag);
  })

});

$(document).ready(function () {

  $("body").on("click", "ul.select li.init", function () {

    // hide other select list if opened
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
