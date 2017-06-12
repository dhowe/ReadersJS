// Interface options (for texts, see src/text-loader.js)

var SPEED = {
  Fluent: 0.4,
  Steady: 0.8,
  Slow: 1.2,
  Slower: 1.6,
  Slowest: 2.0,
  Fast: 0.2
};

var STYLE = {
  Grey: 70,
  Faint: 40,
  Invisible: 0
};

var COLOR = {
  Black: 0,
  White: 255
};

var bgColor = 0,
  uiLogging = true,
  activeReadersBeforeSolo,
  maxFocusLog = Math.floor(window.innerHeight / 30);

function createInterface() {

  Reader.instances.forEach(function(reader) {

    var rb = createCheckbox(" ", !reader.hidden);
    rb.class("reader");
    rb.elt.children[1].setAttribute("title","enable/disable");
    rb.id(reader.type);
    rb.parent("interface");

    var text = createP(reader.name());
    text.parent(rb);

    var focusButton = createCheckbox("F", false);
    focusButton.class("smallButton focus");
    focusButton.attribute("title", "focus");
    focusButton.changed(focusButtonPushed);
    focusButton.value(reader.type);
    focusButton.parent(rb);

    var soloButton = createCheckbox("S", false);
    soloButton.class("smallButton solo");
    soloButton.attribute("title", "solo");
    soloButton.changed(soloButtonPushed);
    soloButton.value(reader.type);
    soloButton.parent(rb);

    var selectWrapper = createDiv("");
    selectWrapper.class("select");
    selectWrapper.attribute("title", "speed");
    selectWrapper.parent(rb);

    var speedSelect = initSelect(
      "speedSelect",
      "full",
      Object.keys(SPEED),
      speedChanged,
      selectWrapper
    );
    speedSelect.value(speedToName(reader.speed));
    speedSelect.source = reader;

    // rb.child(document.getElementById('hoverTextWrapper').cloneNode(true)); // onhover message
  });

  var textSelect,
    styleSelect,
    themeSelect,
    uiElements = [
      (textSelect = initSelect("textSelect", "full", textNames(), textChanged)),
      (styleSelect = initSelect(
        "styleSelect",
        "half",
        Object.keys(STYLE),
        themeChanged
      )),
      (themeSelect = initSelect(
        "themeSelect",
        "half",
        ["Dark", "Light"],
        themeChanged
      ))
    ];

  // set initial class
  styleSelect.value("Faint");
  var focused = pManager.focus();

  if (focused) {
    if (focused.hidden) {

      focused = randomReader();
      warn("Focus repair" + (focused ? ": " + focused.type // FIX ME
            : " failed: " + (activeReaders().length + " readers")));
    }
    focusChanged(focused);
  }

  // Append elements to interface
  var descText = ["Text", "Style", "Theme"];
  for (var i = 0; i < uiElements.length; i++) {

    var wrapper = createDiv("");
    wrapper.addClass("item").parent("interface");
    createP(descText[i]).parent(wrapper);
    var selectWrapper = createDiv("");
    selectWrapper.class("select");
    uiElements[i].parent(selectWrapper);
    wrapper.child(selectWrapper);
  }

  var timeoutId,
    instructions = document.getElementById("instructions"),
    menu = document.getElementById("interface");

  ////////////////////////////////////////////////////////////////////

  function textNames() {
    var names = [];
    TEXTS.forEach(function(text) {
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

  // function styleChanged() {
  //   var col = (bgColor == 0) ? COLOR.White : COLOR.Black,
  //     name = styleSelect.value(),
  //     style = STYLE[name];
  //   log("[UI] Style: " + name + "/" + style);
  //   pManager.gridFill(colorToObject(col, style));
  // }

  function resetFocus() {
    var focused = pManager.focus(), actives = activeReaders();

    // if only one reader is active and its not focused, give it focus
    if (actives.length == 1 && actives[0] !== focused) {
      assignFocus(actives[0]);
    }

    // if focused reader is hidden, pick a random visible
    focused = pManager.focus();
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

    pManager.focus(focused);
    if (focused) {
      // only if we have an active reader
      document.getElementById(focused.type).className += " focused";
      pManager.makeFocusedReaderVisible();
    }

    // clear focusDisplay, change color
    $("#focusDisplay").html("");
    $("#focusDisplayTag").css("color", focused ?
      getCSSFromColor(focused.activeFill) : "#EEE"
    );

    // turn off other focusButtons
    var eles = document.getElementsByClassName("smallButton focus");
    for (var i = 0; i < eles.length; i++) {
      eles[i].firstElementChild.checked = eles[i].parentNode.id === focused.type
        ? true : false;
    }
  }

  function clearFocus() {
    var rdrs = document.getElementsByClassName("reader");
    for (var i = 0; i < rdrs.length; i++) {
      rdrs[i].className = rdrs[i].className.replace(" focused", "");
    }
  }

  function readerOnOffEvent(reader, onOffSwitch) {
    reader.hide(!onOffSwitch);

    if (document.getElementById(reader.type).className.indexOf("solo") > -1)
      unsolo(reader);

    resetFocus();

    log("[UI] " + reader.type + (reader.hidden ? ": Off" : ": On"));
  }

  function focusChanged(focused) {
    log("[UI] Focus: " + focused.type);
    focused && pManager.focus(focused);
    assignFocus(focused);
  }

  function focusButtonPushed() {
    if (this.elt.firstElementChild.checked) {
      focusChanged(Reader.firstOfType(this.elt.parentElement.id));
    } else {
      // if it is the current focus, do nothing (or random select another one?)
      this.elt.firstElementChild.checked = true;
    }
  }

  function soloButtonPushed() {
    var targetReader = Reader.firstOfType(this.elt.parentElement.id);
    if (this.elt.firstElementChild.checked) solo(targetReader);
    else unsolo();
  }

  function solo(targetReader) {
    var readers = document.getElementsByClassName("reader");

    // disable all other readers, turn off active readers in the background
    for (var i = 0; i < readers.length; i++) {
      var reader = Reader.firstOfType(readers[i].id);
      if (reader != targetReader) {
        readers[i].className = "reader disabled";
        reader.hide(true);
        //turn off other solo Buttons
        readers[i].getElementsByClassName(
          "smallButton solo"
        )[0].firstElementChild.checked = false;
      } else {
        reader.hide(false);
        readers[i].className = "reader solo";
      }
    }

    // change focus to the current reader
    focusChanged(targetReader);
    document
      .getElementById(targetReader.type)
      .getElementsByClassName("smallButton focus"
      )[0].firstElementChild.checked = true;
  }

  function unsolo(r) {
    // turn on other readers
    var readers = document.getElementsByClassName("reader");

    for (var i = 0; i < readers.length; i++) {
      var reader = Reader.firstOfType(readers[i].id);
      readers[i].classList.remove("disabled");
      readers[i].classList.remove("solo");
      readers[i].getElementsByClassName(
          "smallButton solo"
      )[0].firstElementChild.checked = false;
      //if the reader is checked in interface, turn it on
      if (readers[i].firstElementChild.checked === true && reader != r) {
        reader.hide(false);
      }
    }
  }

  function speedToName(spd) {
    var result;
    Object.keys(SPEED).forEach(function(name) {
      if (SPEED[name] === spd) result = name;
    });
    if (!result) throw Error("unknown speed: " + spd);
    return result;
  }

  function speedChanged() {
    var spd = this.value();
    this.source.speed = SPEED[spd];
    log("[UI] " + this.source.type + ".speed=" + this.source.speed);
  }

  function log() {
    uiLogging && console.log.apply(console, arguments);
  }

  ////////////////////////////////////////////////////////////////////

  window.onresize = function() {
    // recalculate maxLog when window height changes
    maxFocusLog = Math.floor(window.innerHeight / 30);
  };

  document.getElementById("options").addEventListener(
    "click",
    function() {
      if (menu.offsetHeight === 0) {
        menu.style.display = "block";
        instructions.style.visibility = "hidden";
        options.classList = "";
      } else {
        menu.style.display = "none";
        instructions.style.visibility = "visible";
        options.classList = "clear";
      }
    },
    false
  );

  // hide interface
  document.getElementsByTagName("body")[0].addEventListener(
    "click",
    function(event) {
      var ui = document.getElementById("interface");
      if (
        ui.offsetHeight > 0 &&
        ui.offsetWidth > 0 &&
        (event.pageX > ui.offsetWidth || event.pageY > ui.offsetHeight)
      )
        ui.style.display = "none";
    },
    false
  );

  ////////////////////////////////////////////////////////////////////

  function onReaderSingleClick(ele) {
    var reader = Reader.firstOfType(ele.parentNode.id),
      state = !ele.parentNode.getElementsByTagName("input")[0].checked;
    readerOnOffEvent(reader, state);
  }

  menu.addEventListener("click", function(event) {
    var ele = event.target;
    if (ele.matches(".reader.disabled") || (ele.matches(".reader > label") && ele.parentNode.matches(".reader.disabled"))) {
      unsolo();
    }
    if (ele.matches(".reader > label")) {
      onReaderSingleClick(ele);
    }
  });

  // No more in use
  // menu.addEventListener('mouseover', function (event) {
  //   var ele = event.target;
  //   if (ele.matches('.reader label') && !timeoutId) {
  //     timeoutId = window.setTimeout(function () {
  //       timeoutId = null;
  //       ele.parentNode.querySelector("#hoverTextWrapper").classList = "hover";
  //     }, 1000);
  //   }
  // })

  menu.addEventListener("mouseout", function(event) {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    var his = document.getElementsByClassName("helpInfo");
    for (var i = 0; i < his.length; i++) {
      his[i].style.display = "none";
    }
  });

} // end createInterface

function focusJump(focused) {
  $("#focusDisplay").html("");
}

function getCSSFromColor(colorObj) {
  if (colorObj === undefined) return null;
  else return "rgb(" + colorObj.r + "," + colorObj.g + "," + colorObj.b + ")";
}

function pauseInterface(val) {
  Reader.pauseAll(val);
  if (!val) themeChanged();
}

// handle cases where tab is not the active tab, sleep, screensaver
document.addEventListener("visibilitychange", function() {
  if (!document.hidden) console.log("[UI] Tab reactivated");
  pauseInterface(document.hidden);
});

/*
// handle cases where window loses focus
$(window).blur(function() {
  console.log('[UI] Window lost focus');
  pauseInterface(true);
});

// handle cases where window regains focus
$(window).focus(function() {
  console.log('[UI] Window regained focus');
  pauseInterface(false);
});
*/

$(document).ready(function() {

  $("#focusDisplayTag").click(function() {
    var tag = $("#focusDisplay:visible").length === 0 ? " - " : " + ";
    $("#focusDisplay").toggle("slide");
    $("#status").html(tag);
  });

  $("body").on("click", "ul.select li.init", function() {
    // hide other select list if opened
    $("ul").children("li:not(.init)").hide();
    $("ul").children("li.init").show();
    $(this).closest("ul").children("li").toggle();
  });

  $("body").on("click", "ul.select li:not(.init)", function() {
    var allOptions = $("ul").children("li:not(.init)");
    allOptions.removeClass("selected");
    $(this).addClass("selected");
    $(this).closest("ul").children(".init").html($(this).html());
    $(this).closest("ul").children("li").toggle();
  });
});
