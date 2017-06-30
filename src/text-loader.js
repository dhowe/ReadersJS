var TEXTS = [{
  title: 'Misspelt Landings',
  file: 'data/misspeltLandings.txt',
  trigrams: 'data/misspeltLandings-trigrams.js',
  mesostic: 'reaching out falling through circling over landing on turning within spelling as'
}, {
  title: 'Poetic Caption',
  file: 'data/poeticCaption.txt',
  trigrams: 'data/poeticCaption-trigrams.js',
  mesostic: 'reading as writing through'
}, {
  title: 'The Image',
  file: 'data/image.txt',
  trigrams: 'data/theImage-trigrams.js',
  mesostic: 'comes in is over goes out is done lolls in stays there is had no more'
}];

var notify, timerStart = Date.now(),
  textLoaded = [ TEXTS[0].title ];

function loadTrigrams(callback) {

  if (typeof InstallTrigger !== 'undefined' && !location.href.includes('localhost')) {// tmp: Firefox
    document.getElementById('overlay').innerHTML = "<br>Currently runs only on Chrome/Chromium/Opera/Safari</p>";
    window.mocha = 1; // disable p5.js
    return;
  }

  var menu = document.getElementById('interface'),
      overlay = document.getElementById('overlay');

  var monitor = function(element, callback) {

    var self = element;
    var h = self.clientHeight;
    var w = self.clientWidth;
    var txt = self.innerText;
    var html = self.innerHTML;
    (function flux() {
      setTimeout(function () {
        var done = h === self.clientHeight &&
          w === self.clientWidth &&
          txt === self.innerText &&
          html === self.innerHTML;
        if (done) {
          callback();
        } else {
          h = self.clientHeight;
          w = self.clientWidth;
          txt = self.innerText;
          html = self.innerHTML;
          flux();
        }
      }, 250);
    })()
  };

  monitor(menu, function () {

    // fadeout overlay
    overlay.classList.toggle('fade', setTimeout(function () {
      // overlay.style.display = "none";
      var time = Date.now() - timerStart - 2000; // WHY -2000 ?
      console.log('[UI] Loaded (' + time + 'ms)');
      reloadTheRest();

    }, 2000));
  });

  loadTheFirst(callback);
}

function finishLoading(text, callback) {

  textLoaded.push(text);
  var time = Date.now() - timerStart;

  console.log('[TRIGRAMS] ' + text + ' ' + time + 'ms');

  if (callback) callback();

  if (overlay.classList.value === "" && notify === text) {
    overlay.classList.toggle('fade');
    textChanged();
  }
}

function createScriptTag(src, id, callback) {
    var script = document.createElement("script");
    script.src = src;
    script.id = id;
    document.getElementsByTagName("head")[0].append(script);
    script.onload = function() {
      finishLoading(id, callback);
    };
}

function loadTheFirst(callback) {
    createScriptTag(TEXTS[0].trigrams, TEXTS[0].title, callback);
}

function reloadTheRest() {
  for (var i = 1; i < TEXTS.length; i++) { // skip the first text
      createScriptTag(TEXTS[i].trigrams, TEXTS[i].title);
  }
}
