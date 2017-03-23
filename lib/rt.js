(function (window, undefined) {

  // TODO: remove methods that are duplicated in rita.js

  function toColArr(obj, overrideAlpha) {

    var a = (typeof overrideAlpha === 'undefined') ? obj.a || 255 : overrideAlpha;
    return [obj.r, obj.g, obj.b, a];
  }

  function isNum(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function parseColor() { // FIX: expects to be bound to a RiText

    var a = arguments, len = a.length,
      alpha = (this && this.alpha) ? this.alpha() : 255;

    var color = {
      r: 0,
      g: 0,
      b: 0,
      a: alpha
    };

    if (!len) return color;

    if (len == 1 && is(a[0], A)) {
      return parseColor.apply(this, a[0]);
    }

    if (typeof a[0] === 'undefined')
      throw Error("Invalid Color Arguments!");

    if (len >= 3) {
      color.r = a[0];
      color.g = a[1];
      color.b = a[2];
    }
    if (len == 4) {
      color.a = a[3];
    }
    if (len <= 2) {
      color.r = a[0];
      color.g = a[0];
      color.b = a[0];
    }
    if (len == 2) {
      color.a = a[1];
    }

    return color;
  }

  function err(msg) {

    console.log("err(msg) :: " + typeof console.trace);

    (!RiTa.SILENT) && (console && console.trace(this));

    throw Error("[RiTa] " + msg);
  }

  function warn() {

    if (RiTa.SILENT || !console) return;

    if (arguments && arguments.length) {
      console.warn("[WARN] " + arguments[0]);
      for (var i = 1; i < arguments.length; i++)
        console.warn('  ' + arguments[i]);
    }
  }

  function log() {

    if (RiTa.SILENT || !console) return;

    for (var i = 0; i < arguments.length; i++)
      console.log(arguments[i]);
  }

  function isNode() {

    return (typeof module != 'undefined' && module.exports);
  }

  function makeClass() { // By John Resig (MIT Licensed)

    return function (args) {

      if (this instanceof arguments.callee) {

        if (typeof this.init == "function") {

          this.init.apply(this, args && args.callee ? args : arguments);
        }
      } else {
        return new arguments.callee(arguments);
      }
    };
  }

  function endsWith(str, ending) {

    if (!is(str, S)) return false;
    return new RegExp(ending + '$').test(str);
    //return str.slice(-ending.length) == ending;
  }

  function trim(str) {

    // faster version from: http://blog.stevenlevithan.com/archives/faster-trim-javascript
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  function lerp(start, stop, amt) {
    return amt * (stop - start) + start;
  }

  function lerpCol(from, to, amt) {

    amt = Math.max(Math.min(amt, 1), 0);

    var l = {};

    l.r = lerp(from.r, to[0], amt);
    l.g = lerp(from.g, to[1], amt);
    l.b = lerp(from.b, to[2], amt);
    if (to.length > 3)
      l.a = lerp(from.a, to[3], amt);

    return l;
  }

  function lerpCol2(from, to, amt) {

    amt = Math.max(Math.min(amt, 1), 0);

    var l = {};

    l.r = lerp(from.r, to.r, amt);
    l.g = lerp(from.g, to.g, amt);
    l.b = lerp(from.b, to.b, amt);
    l.a = lerp(from.a, to.a, amt);

    return l;
  }

  function lerpColArr(fromArray, toArray, amt) {

    if (fromArray.length != toArray.length)
      throw Error('invalid arr lengths');

    amt = Math.max(Math.min(amt, 1), 0);

    var l = [0,0,0];
    l[0] = lerp(fromArray[0], toArray[0], amt);
    l[1] = lerp(fromArray[1], toArray[1], amt);
    l[2] = lerp(fromArray[2], toArray[2], amt);
    if (fromArray.length > 3)
      l[3] = lerp(fromArray[3], toArray[3], amt);

    return l;
  }

  //////////////////////////////////////////////////////////////////////
  // RiText statics
  //////////////////////////////////////////////////////////////////////

  isNode() && (require('./rita'));

  var RiText = makeClass();

  RiText._defaults = {

    // TODO(v2.0): change fontSize to _fontSize;
    fill: {
      r: 0,
      g: 0,
      b: 0,
      a: 255
    },
    fontFamily: 'Times New Roman',
    alignment: RiTa.LEFT,
    motionType: RiText.LINEAR,
    _font: null,
    fontSize: 14,
    paragraphLeading: 0,
    paragraphIndent: 30,
    indentFirstParagraph: false,
    boundingStroke: null,
    boundingStrokeWeight: 1,
    showBounds: false,
    boundingFill: null,
    leadingFactor: 1.2,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    metrics: {
      "name": "Times New Roman",
      "size": 14,
      "ascent": 9.744,
      "descent": 3.024,
      "widths": {
        "0": 7,
        "1": 7,
        "2": 7,
        "3": 7,
        "4": 7,
        "5": 7,
        "6": 7,
        "7": 7,
        "8": 7,
        "9": 7,
        "!": 5,
        "\"": 6,
        "#": 7,
        "$": 7,
        "%": 12,
        "&": 11,
        "'": 3,
        "(": 5,
        ")": 5,
        "*": 7,
        "+": 8,
        ",": 4,
        "-": 5,
        ".": 4,
        "/": 4,
        ":": 4,
        ";": 4,
        "<": 8,
        "=": 8,
        ">": 8,
        "?": 6,
        "@": 13,
        "A": 10,
        "B": 9,
        "C": 9,
        "D": 10,
        "E": 9,
        "F": 8,
        "G": 10,
        "H": 10,
        "I": 5,
        "J": 5,
        "K": 10,
        "L": 9,
        "M": 12,
        "N": 10,
        "O": 10,
        "P": 8,
        "Q": 10,
        "R": 9,
        "S": 8,
        "T": 9,
        "U": 10,
        "V": 10,
        "W": 13,
        "X": 10,
        "Y": 10,
        "Z": 9,
        "[": 5,
        "\\": 4,
        "]": 5,
        "^": 7,
        "_": 7,
        "`": 5,
        "a": 6,
        "b": 7,
        "c": 6,
        "d": 7,
        "e": 6,
        "f": 5,
        "g": 7,
        "h": 7,
        "i": 4,
        "j": 4,
        "k": 7,
        "l": 4,
        "m": 11,
        "n": 7,
        "o": 7,
        "p": 7,
        "q": 7,
        "r": 5,
        "s": 5,
        "t": 4,
        "u": 7,
        "v": 7,
        "w": 10,
        "x": 7,
        "y": 7,
        "z": 6,
        "{": 7,
        "|": 3,
        "}": 7,
        " ": 4
      }
    }
  };

  /*  @private Simple type-checking functions */
  var Type = {

      N: 'number',
      S: 'string',
      O: 'object',
      A: 'array',
      B: 'boolean',
      R: 'regexp',
      F: 'function',

      // From: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
      get: function (obj) {

        if (typeof obj == 'undefined') return null;
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      },

      // Returns true if the object is of type 'type', otherwise false

      is: function (obj, type) {

        return Type.get(obj) === type;
      },

      // Throws TypeError if not the correct type, else returns true
      ok: function (obj, type) {

        if (Type.get(obj) != type) {

          throw TypeError('Expected ' + (type ? type.toUpperCase() : type + '') +
            ", but received " + (obj ? Type.get(obj).toUpperCase() : obj + ''));
        }

        return true;
      }

    },
    is = Type.is,
    ok = Type.ok; // alias

  var SP = ' ',
    E = '',
    N = Type.N,
    S = Type.S,
    O = Type.O,
    A = Type.A,
    B = Type.B,
    R = Type.R,
    F = Type.F;

  RiText._IDGEN = 0;

  RiText.defaultFill = function (r, g, b, a) {

    if (arguments.length) {
      RiText.defaults.fill = parseColor.apply(RiText, arguments);
    }
    return toColArr(RiText.defaults.fill);
  }

  RiText.defaultFill2 = function (r, g, b, a) {

    var a =  Array.prototype.slice.call(arguments), len = a.length;
    if (len) {

      //RiText.defaults.fill = parseColor.apply(RiText, arguments);
      var color = { r: 0, g: 0, b: 0, a: 255 };
      if (len >= 3) {
        color.r = a[0];
        color.g = a[1];
        color.b = a[2];
      }
      if (len == 4) {
        color.a = a[3];
      }
      if (len <= 2) {
        if (!a[0]) throw Error("");
        color.r = a[0];
        color.g = a[0];
        color.b = a[0];
      }
      if (len == 2) {
        color.a = a[1];
      }
      RiText.defaults.fill = color;
    }
    return toColArr(RiText.defaults.fill);
  }

  RiText.defaultFont = function (font, size) {

    var fontObject = function(f, s) {

      if (f.name) RiText.defaults.fontFamily = f.name;

      RiText.defaults.fontSize = s;
      RiText.defaults._font = f;
    }

    var fontString = function(f, s) {
      RiText.defaults.fontFamily = f;
      RiText.defaults._font = RiText._createFont(f, s);
    }

    var a = arguments;

    // RiText.defaultFont();
    if (a.length === 0) { // 0-args

      if (!RiText.defaults._font) { // if we don't have a font, create it
        RiText.defaults._font = RiText._createFont(RiText.defaults.fontFamily, RiText.defaults.fontSize);
      }
    }
    else {

      if (a.length < 2 || !Number(a[1]))
        a[1] = RiText.defaults.fontSize;

      if (is(a[0], O)) fontObject(a[0], a[1]);
      if (is(a[0], S)) fontString(a[0], a[1]);
    }

    return RiText.defaults._font;
  }

  RiText.randomColor = function (min, max, includeAlpha) {

    min = min || 0, max = max || 256;

    var col = [RiText.random(min, max), RiText.random(min, max), RiText.random(min, max)];
    if (includeAlpha) col.push(RiText.random(min, max));
    return col;
  }

  RiText.random = function () {

    return RiTa.random.apply(this, arguments);
  }

  RiText.picked = function (x, y) {

    var hits = [];
    for (var i = 0; i < RiText.instances.length; i++) {
      var rt = RiText.instances[i];
      rt.contains(x, y) && hits.push(rt);
    }
    return hits;
  }

  RiText._disposeOne = function (toDelete) {

    var items = RiText.instances;

    while (items.indexOf(toDelete) !== -1) {
      items.splice(items.indexOf(toDelete), 1);
    }

    if (toDelete) {

      delete(toDelete.rs);
      toDelete = {};
      toDelete._rs = {};
    }
  }

  RiText._disposeArray = function (toDelete) {

    for (var i = 0; i < toDelete.length; i++) {

      RiText._disposeOne(toDelete[i]);
    }

    toDelete = [];
  }

  RiText.dispose = function (toDelete) {

    is(toDelete, A) && RiText._disposeArray(toDelete);
    is(toDelete, O) && RiText._disposeOne(toDelete);
  }

  RiText._createFont = function (fontName, fontSize) { // p5js

    console.error('[RiTa] No default font loaded: use loadFont && RiText.defaultFont(f) first');
    return;

    textFont(fontName);
    textSize(fontSize);

    this.font = {
      "name": fontName,
      "size": fontSize
      // add textAscent,textDescent,widths?
    }

    return this.font;
  },

  RiText.disposeAll = function () {

    if (arguments.length) {

      RiText.dispose(arguments[0]);
    } else {

      RiText._disposeArray(RiText.instances);
      RiText.instances = [];
    }
  }

  RiText.defaultFontSize = function (size) {

    if (!arguments.length)
      return RiText.defaults.fontSize;

    if (RiText.defaults.fontSize != size) {

      RiText.defaults.fontSize = size;
      RiText.defaults._font = null;
    }
  }

  RiText.drawAll = function (array) {

    if (arguments.length == 1 && is(array, A)) {
      for (var i = 0; i < array.length; i++)
        array[i] && array[i].draw();
    } else {
      for (var j = 0; j < RiText.instances.length; j++)
        RiText.instances[j] && RiText.instances[j].draw();
    }
  }

  RiText.resetDefaults = function () {

    RiText.defaults = RiText._defaults;
  }

  RiText.boundingBox = function (ritexts) { // add-to-api?

    var rts = ritexts,
      minX = Number.MAX_VALUE,
      maxX = -Number.MAX_VALUE,
      minY = Number.MAX_VALUE,
      maxY = -Number.MAX_VALUE;

    if (!is(rts, A)) rts = [ritexts];

    for (var i = 0, j = rts.length; i < j; i++) {

      var bb = rts[i].boundingBox();
      if (bb[0] < minX) minX = bb[0];
      if (bb[1] < minY) minY = bb[1];
      if (bb[0] + bb[2] > maxX) maxX = bb[0] + bb[2];
      if (bb[1] + bb[3] > maxY) maxY = bb[1] + bb[3];
    }

    return [minX, minY, maxX - minX, maxY - minY];
  }


  // Returns the pixel x-offset for the word at 'wordIdx'
  RiText._wordOffsetFor = function (rt, words, wordIdx) {

    if (wordIdx < 0 || wordIdx >= words.length)
      throw new Error("Bad wordIdx=" + wordIdx + " for " + words);
    var xPos = rt.x;
    if (wordIdx > 0) {

      var pre = words.slice(0, wordIdx);
      var preStr = '';
      for (var i = 0; i < pre.length; i++) {
        preStr += pre[i] + ' ';
      }

      var tw = rt._font._textWidth(preStr, RiText.defaults.fontSize);
      switch (rt._alignment) {
      case RiTa.LEFT:
        xPos = rt.x + tw;
        break;
      case RiTa.RIGHT:
        xPos = rt.x - tw;
        break;
      case RiTa.CENTER:
        warn("TODO: test center-align here");
        xPos = rt.x; // ?
        break;
      }
    }
    return xPos;
  }

  RiText._getDefaultFont = function () {
    RiText.defaults._font = RiText.defaults._font ||
      RiText._createFont(RiText.defaults.fontFamily, RiText.defaults.fontSize);
    return RiText.defaults._font;
  }

  RiText.NON_BREAKING_SPACE = "<sp/>";
  RiText.PARAGRAPH_BREAK = "<p/>";
  RiText.LINE_BREAK = "<br/>";
  RiText.instances = [];

  RiText.defaults = RiText._defaults;

  RiText.prototype = {

    init: function (text, x, y, font) {

      var bbs, screenH, args;

      this.fader = {
        startTime: -1,
        duration: -1,
        from: {},
        to: {}
      };

      this.faderId = 0;

      this._color = {
        r: RiText.defaults.fill.r,
        g: RiText.defaults.fill.g,
        b: RiText.defaults.fill.b,
        a: RiText.defaults.fill.a
      };

      this._boundingStrokeWeight = RiText.defaults.boundingStrokeWeight;

      bbs = RiText.defaults.boundingStroke;
      this._boundingStroke = {
        r: (bbs && bbs.r) || this._color.r,
        g: (bbs && bbs.g) || this._color.g,
        b: (bbs && bbs.b) || this._color.b,
        a: this._color.a
      };

      this._boundingFill = RiText.defaults.boundingFill;

      this._showBounds = RiText.defaults.showBounds;
      this._motionType = RiText.defaults.motionType;
      this._alignment = RiText.defaults.alignment;

      this._rotateX = RiText.defaults.rotateX;
      this._rotateY = RiText.defaults.rotateY;
      this._rotateZ = RiText.defaults.rotateZ;

      this._scaleX = RiText.defaults.scaleX;
      this._scaleY = RiText.defaults.scaleY;
      this._scaleZ = 1;

      // handle the arguments
      args = this._initArgs.apply(this, arguments);

      this.font(args[3]);
      this.text(args[0]);

      // 100,100 by default
      this.x = is(args[1], N) ? args[1] : 100;
      this.y = is(args[2], N) ? args[2] : 100;
      this.z = 0;

      //log('RiText: '+this._rs._text +"("+this.x+","+this.y+")"+" / "+ this._font.name);

      RiText.instances.push(this);
      this.id = ++RiText._IDGEN;
      //log(this.id, this.text());
    },

    _initArgs: function () {

      var a = arguments,
        t = Type.get(a[0]);

      //console.error("a[0]="+t+" a.length="+a.length+" type="+t+" analyze="+typeof a[0].text);

      if (a.length && (t === O || t === 'global' || t === 'window') && typeof a[0].analyze != F) {

        // recurse, ignore 'this'
        var shifted = Array.prototype.slice.call(a, 1);

        return this._initArgs.apply(this, shifted);
      }

      var parsed = [E, null, null, null];
      if (a.length) {

        if (is(a[0], S)) // String
          parsed[0] = a[0];

        else if (is(a[0], O) && typeof a[0].text == F)
          parsed[0] = a[0].text(); // RiString

        else if (is(a[0], N)) // Number
          parsed[0] = String.fromCharCode(a[0]);

        else if (!RiTa.SILENT)
          console.error("Unexpected arg in RiText(" + a[0] + " [type=" + (typeof a[0]) + "])");
      }

      if (a.length > 1) parsed[1] = a[1];
      if (a.length > 2) parsed[2] = a[2];
      if (a.length > 3) parsed[3] = a[3];

      return parsed;
    },

    get: function (fn) {

      return this._rs.get(fn);
    },

    features: function () {

      return this._rs.features();
    },

    draw: function () {

      //if (this.text()==='stone') console.log(frameCount,this._color);
      return this._update()._render();
    },

    _update: function () {

      var f = this.fader, dbug = 0;

      if (dbug&&!window.lastLog) window.lastLog = 1;

      if (this._faderAlive()) {
        this._color = lerpCol(f.from, f.to, this._faderProgress());
        if (dbug&&millis() - window.lastLog > 100) {
          var t = (round(this._faderElapsed()/100)/10)+'s';
          console.log(this._faderElapsed(), this._color);
          window.lastLog = millis();
        }
      }

      return this;
    },

    _faderElapsed: function () {
      return (millis() - this.fader.startTime);
    },

    _faderProgress: function () {
      return this._faderElapsed() / this.fader.duration;
    },

    _faderAlive: function () {
      return this.fader.startTime + this.fader.duration > millis()
    },

    colorTo: function (col, seconds, delay) {

      delay = delay || 0;

      var rt = this;

      /*rt.faderId = */setTimeout(function() {
        //clearTimeout(rt.faderId);
        rt.fader = {
          startTime: millis(),
          duration: seconds * 1000,
          from: rt._color,
          to: col,
        }

      }, delay * 1000);
    },

    boundingBox: function () {

      var bb = this._font.textBounds(this._rs.text(), this.x, this.y, this._font.size || RiText.defaults.fontSize);
      return { x: bb.x, y: bb.y, width: bb.w, height: bb.h };
    },

    _render: function () {

      if (this._rs && this._rs.length) {

        push();

        var fontSize = this._font.size || RiText.defaults.fontSize,
          ascent = this._font._textAscent(fontSize),
          descent = this._font._textDescent(fontSize),
          bb = this.boundingBox();

        translate(this.x, this.y);
        translate(bb.width / 2, bb.height / -4);
        rotate(this._rotateZ);
        translate(bb.width / -2, bb.height / 4);
        scale(this._scaleX, this._scaleY, this._scaleZ);

        // Set color
        fill(this._color.r, this._color.g, this._color.b, this._color.a);

        // Set font params
        textFont(this._font);
        textSize(fontSize);
        textAlign(this._alignment);

        // Draw text
        text(this._rs._text, 0, 0);

        // And the bounding box
        if (this._showBounds) {

          noFill();
          if (this._boundingFill)
            fill(this._boundingFill.r, this._boundingFill.g, this._boundingFill.b, this._color.a);

          stroke(this._boundingStroke.r, this._boundingStroke.g,
            this._boundingStroke.b, this._color.a);

          strokeWeight(this._boundingStrokeWeight);

          rect(0, -ascent, bb.width, ascent + descent);
        }

        pop();
      }

      return this;
    },

    analyze: function () {

      this._rs.analyze();
      return this;
    },

    text: function (txt) {

      if (arguments.length == 1) {

        var theType = Type.get(txt);

        if (theType == N) {
          txt = String.fromCharCode(txt);
        } else if (theType == O && typeof txt.text == F) {
          txt = txt.text();
        }
        this._rs = (this._rs) ? this._rs.text(txt) : new RiString(txt);

        return this;
      }

      return this._rs._text;
    },

    match: function (pattern) {

      return this._rs.match(pattern);

    },

    charAt: function (index) {

      return this._rs.charAt(index);

    },

    concat: function (riText) {

      return this._rs._text.concat(riText.text());

    },

    containsWord: function (text) {

      return this._rs.indexOf(text) > -1;

    },

    endsWith: function (ending) {
      if (!is(this._rs._text, S)) return false;
      return new RegExp(ending + '$').test(this._rs._text);
    },

    equals: function (RiText) {

      return RiText._rs._text === this._rs._text;

    },

    equalsIgnoreCase: function (str) {

      if (typeof str === S) {

        return str.toLowerCase() === this._rs._text.toLowerCase();
      } else {

        return str.text().toLowerCase() === this._rs._text.toLowerCase();
      }

    },

    indexOf: function (searchstring, start) {

      return this._rs._text.indexOf(searchstring, start);

    },

    lastIndexOf: function (searchstring, start) {

      return this._rs._text.lastIndexOf(searchstring, start);

    },

    length: function () {

      return this._rs._text.length;

    },

    pos: function () {

      var words = RiTa.tokenize((this._rs._text)); // was getPlaintext()
      var tags = RiTa.getPosTags(words);

      for (var i = 0, l = tags.length; i < l; i++) {
        if (!(typeof tags[i] === S && tags[i].length > 0))
          err("RiText: can't parse pos for:" + words[i]);
      }

      return tags;

    },

    posAt: function (index) {

      var tags = this._rs.pos();

      if (!tags || !tags.length || index < 0 || index >= tags.length)
        return E;

      return tags[index];

    },

    insertChar: function (ind, theChar) {

      this._rs.insertChar.apply(this._rs, arguments);
      return this;

    },

    removeChar: function (ind) {

      this._rs.removeChar.apply(this._rs, arguments);
      return this;

    },

    replaceChar: function (idx, replaceWith) {

      this._rs.replaceChar.apply(this._rs, arguments);
      return this;
    },

    replaceFirst: function (regex, replaceWith) {

      this._rs.replaceFirst.apply(this._rs, arguments);
      return this;
    },

    replaceAll: function (pattern, replacement) {

      this._rs.replaceAll.apply(this._rs, arguments);
      return this;
    },

    replaceWord: function (wordIdx, newWord) {

      this._rs.replaceWord.apply(this._rs, arguments);
      return this; // TODO: check that all RiText methods use the delegate
      //  (like above) for methods that exist in RiString
    },

    removeWord: function (wordIdx) {

      this._rs.removeWord.apply(this._rs, arguments);
      return this;
    },

    insertWord: function (wordIdx, newWord) {

      this._rs.insertWord.apply(this._rs, arguments);
      return this;
    },

    slice: function (begin, end) {

      var res = this._rs._text.slice(begin, end) || E;
      return this._rs.text(res);

    },

    startsWith: function (substr) {

      return this._rs.indexOf(substr) === 0;
    },

    substring: function (from, to) {

      return this._rs.text(this._rs._text.substring(from, to));
    },

    substr: function (start, length) {

      var res = this._rs._text.substr(start, length);
      return this._rs.text(res);
    },

    toLowerCase: function () {

      return this._rs.text(this._rs._text.toLowerCase());
    },

    toUpperCase: function () {

      return this._rs.text(this._rs._text.toUpperCase());
    },

    trim: function () {

      return this._rs.text(trim(this._rs._text));
    },

    wordAt: function (index) {

      var words = RiTa.tokenize((this._rs._text));
      if (index < 0 || index >= words.length)
        return E;
      return words[index];
    },

    wordCount: function () {

      if (!this._rs._text.length) return 0;
      return this.words().length;
    },

    words: function () {

      return RiTa.tokenize(this._rs._text);
    },

    distanceTo: function (a, b) {

      var p2x, p2y, p1 = this.center();

      if (a.length == 1 && is(a.center, F)) {
        p2 = a.center();
        p2x = p2[0];
        p2y = p2[1];
      } else {
        p2x = a;
        p2y = b;
      }

      return RiTa.distance(p1[0], p1[1], p2x, p2y);
    },

    center: function () {

      var bb = this.boundingBox(); // note: this is different than RiTa (TODO: sync)
      return [bb[0] + bb[2] / 2.0, bb[1] + bb[3] / 2.0];
    },

    splitWords: function (regex) {

      regex = regex || SP;

      (typeof regex == S) && (regex = new RegExp(regex));

      var l = [];
      var txt = this._rs._text;
      var words = txt.split(regex);

      for (var i = 0; i < words.length; i++) {
        if (words[i].length < 1) continue;
        var tmp = this.copy();
        tmp.text(words[i]);
        var mx = RiText._wordOffsetFor(this, words, i);
        tmp.position(mx, this.y);
        l.push(tmp);
      }

      return l;
    },

    contains: function (mx, my) {

      var bb = this.boundingBox(true);
      bb[0] += this.x;
      bb[1] += this.y;

      return (!(mx < bb[0] || mx > bb[0] + bb[2] || my < bb[1] || my > bb[1] + bb[3]));
    },

    copy: function () {

      var c = new RiText(this.text(), this.x, this.y, this._font);

      for (var prop in this) {
        if (typeof this[prop] == F || typeof this[prop] == O)
          continue;
        c[prop] = this[prop];
      }

      c.fill(this._color.r, this._color.g, this._color.b, this._color.a);

      return c;
    },

    align: function (align) {

      if (arguments.length) {
        this._alignment = align;
        return this;
      }
      return this._alignment;
    },

    font: function (font, size) { // TODO: cases for when arg1 is object & string

      var a = arguments;

      if (a.length == 1) {

        if (is(font, S)) {

          if (/\.vlw$/.test(font)) {

            warn(".vlw fonts not supported in RiTaJS! Ignoring: '" + font + "'");
            this._font = RiText._getDefaultFont();
            return this;
          }

          this._font = RiText._createFont(font, RiText.defaults.fontSize);
          return this;
        }

        this._font = font || RiText._getDefaultFont();
        return this;

      } else if (a.length == 2) {

        this._font = RiText._createFont(a[0], a[1]);
        return this;
      }

      return this._font;
    },

    showBounds: function (trueOrFalse) {

      if (arguments.length == 1) {

        this._showBounds = trueOrFalse;
        return this;
      }

      return this._showBounds;
    },

    fill: function (cr, cg, cb, ca) {

      if (arguments.length === 0) {
        return this._color;
      }

      this._color = parseColor.apply(this, arguments);

      //if (this.text()==='stone') console.log('fill:',this._color);
      return this;
    },

    boundingFill: function (cr, cg, cb, ca) {

      if (arguments.length === 0)
        return this._boundingFill;
      this._boundingFill = parseColor.apply(this, arguments);
      return this;
    },

    boundingStroke: function (cr, cg, cb, ca) {

      if (arguments.length === 0)
        return this._boundingStroke;
      this._boundingStroke = parseColor.apply(this, arguments);
      return this;
    },

    isVisible: function () {

      if (arguments.length)
        err('isVisible() takes no arguments');

      return this._color.a > 0;
    },

    alpha: function (a) {
      if (arguments.length == 1) {
        this._color.a = a;
        return this;
      } else return this._color.a;
    },

    position: function (x, y) {

      //TODO: add Z

      if (!arguments.length)
        return [this.x, this.y];
      this.x = x;
      this.y = y;
      return this;
    },

    rotate: function (rotate) {

      //TODO: add X,Y ??
      if (!arguments.length)
        return [this._rotateZ]
      this._rotateZ = rotate;
      return this;
    },

    scale: function (theScaleX, theScaleY) {

      if (!arguments.length) return {
        x: this._scaleX,
        y: this._scaleY
      }; //TODO: add Z

      if (arguments.length == 1) theScaleY = theScaleX;

      this._scaleX = theScaleX;
      this._scaleY = theScaleY;

      return this;
    },

    charOffset: function (charIdx) {

      var theX = this.x;

      if (charIdx > 0) {

        var txt = this.text();

        var len = txt.length;
        if (charIdx > len) // -1?
          charIdx = len;

        var sub = txt.substring(0, charIdx);
        theX = this.x + this.textWidth(sub);
      }

      return theX;
    },

    wordOffset: function (wordIdx) {

      return RiText._wordOffsetFor(this, this.words(), wordIdx);
    },

    textWidth: function () {

      return this.boundingBox().width;
    },

    textHeight: function () { // tight bounds

      return this.boundingBox().height;
    },

    fontSize: function (f) {

      if (!arguments.length) {

        return this._font ? this._font.size : -1;
      }

      if (this._font && (this._font.size == f))
        return this; // no-op

      var name = RiText.defaults.fontFamily;
      if (this._font && this._font.name)
        name = this._font.name;

      this.font(name, f); // recreate	from name/sz

      return this;
    },

    textAscent: function () {

      throw Error('not yet unimplemented');
    },

    textDescent: function () {

      throw Error('not yet unimplemented');
    },

    toString: function () {

      var s = (this._rs && this._rs._text) || 'undef';
      return '[' + Math.round(this.x) + "," + Math.round(this.y) + ",'" + s + "']";
    }
  }

  // inject into appropriate global scope
  window && (window['RiText'] = RiText);

})(typeof window !== 'undefined' ? window : null);
