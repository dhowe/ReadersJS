// URL query parameters for configuring the Readers window, e.g.
//   index.html?fullscreen&text=The Image&theme=Light&readers=PerigramReader,MesosticJumper
//
//   fullscreen  hide all interface elements, showing only the readers window
//               (browsers require a user gesture, so true full screen
//               begins on the first click/keypress)
//   text        a text title from TEXTS (see src/text-loader.js), so new
//               texts are accepted automatically
//   style       a key of STYLE (see src/multi-page-ui.js): Grey, Faint, Invisible
//   theme       Dark or Light
//   readers     comma-separated reader types to enable (all others are turned off)
//   focus       the reader type that has focus (enabled if 'readers' omits it)
//   solo        a single reader type to run on its own
//   speed       a key of SPEED for all readers (e.g. Slow), and/or per reader
//               as Type:Speed pairs, e.g. speed=Fast,MesosticJumper:Slowest
//
// Matching of names ignores case, spaces, hyphens and underscores.

var URL_PARAMS = parseUrlParams(window.location.search);

if (URL_PARAMS.fullscreen) {
  document.documentElement.classList.add('fullscreen-mode');
  armFullscreen();
}

function parseUrlParams(search) {

  var params = new URLSearchParams(search), result = {}, val;

  val = params.get('fullscreen');
  result.fullscreen = val !== null && !/^(0|false|no|off)$/i.test(val);

  ['text', 'style', 'theme', 'focus', 'solo'].forEach(function (key) {
    if (params.get(key)) result[key] = params.get(key).trim();
  });

  ['readers', 'speed'].forEach(function (key) {
    if (params.get(key)) result[key] = params.get(key).split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);
  });

  return result;
}

function armFullscreen() {

  var go = function () {
    window.removeEventListener('click', go);
    window.removeEventListener('keydown', go);
    var ele = document.documentElement,
      request = ele.requestFullscreen || ele.webkitRequestFullscreen;
    if (request && !document.fullscreenElement) {
      var p = request.call(ele);
      p && p.catch && p.catch(function (e) {
        console.warn('[URL] Fullscreen failed: ' + e.message);
      });
    }
  };
  window.addEventListener('click', go);
  window.addEventListener('keydown', go);
}

// Called at the end of createInterface(), with the interface's local handlers
function applyUrlParams(ui) {

  var p = URL_PARAMS, readerTypes = Reader.instances.map(function (r) {
    return r.type;
  });

  function norm(s) {
    return String(s).toLowerCase().replace(/[\s_\-]+/g, '');
  }

  function match(value, names, what) {
    for (var i = 0; i < names.length; i++) {
      if (norm(names[i]) === norm(value)) return names[i];
    }
    console.warn('[URL] Unknown ' + what + ' "' + value +
      '", expected one of: ' + names.join(', '));
  }

  function matchReader(value) {
    return match(value, readerTypes, 'reader');
  }

  function readerInput(type, cls) {
    var ele = document.getElementById(type);
    if (cls) ele = ele.getElementsByClassName(cls)[0];
    return ele.getElementsByTagName('input')[0];
  }

  function selectValue(id, value) {
    document.getElementById(id).value = value;
  }

  var textName = p.text && match(p.text, TEXTS.map(function (t) {
      return t.title;
    }), 'text'),
    styleName = p.style && match(p.style, Object.keys(STYLE), 'style'),
    themeName = p.theme && match(p.theme, ['Dark', 'Light'], 'theme');

  // text, style, theme
  styleName && selectValue('styleSelect', styleName);
  themeName && selectValue('themeSelect', themeName);

  if (textName && textName !== TEXTS[0].title) {
    selectValue('textSelect', textName);
    var text = textFromName(textName);
    if (textLoaded.indexOf(textName) > -1) {
      resetText(textName);
    } else {
      createScriptTag(text.trigrams, textName, function () {
        resetText(textName);
      });
    }
  }
  themeChanged();

  // readers on/off
  var focusType = p.focus && matchReader(p.focus),
    soloType = p.solo && matchReader(p.solo);

  if (p.readers) {
    var enabled = p.readers.map(matchReader).filter(Boolean);
    focusType && enabled.indexOf(focusType) < 0 && enabled.push(focusType);
    Reader.instances.forEach(function (r) {
      var on = enabled.indexOf(r.type) > -1;
      readerInput(r.type).checked = on;
      ui.readerOnOffEvent(r, on);
    });
  }

  // speeds
  (p.speed || []).forEach(function (entry) {
    var parts = entry.split(':'),
      speed = match(parts[parts.length - 1], Object.keys(SPEED), 'speed'),
      type = parts.length > 1 && matchReader(parts[0]);
    if (!speed || (parts.length > 1 && !type)) return;
    Reader.instances.forEach(function (r) {
      if (type && r.type !== type) return;
      r.speed = SPEED[speed];
      document.getElementById(r.type).getElementsByTagName('select')[0].value = speed;
    });
  });

  // focus & solo
  if (focusType) {
    var fr = Reader.firstOfType(focusType);
    if (fr.hidden) { // focus on a reader that was turned off (no 'readers' param)
      readerInput(focusType).checked = true;
      ui.readerOnOffEvent(fr, true);
    }
    ui.focusChanged(fr);
  }
  if (soloType) {
    var sr = Reader.firstOfType(soloType);
    ui.solo(sr);
    readerInput(soloType, 'solo').checked = true;
  }
}
