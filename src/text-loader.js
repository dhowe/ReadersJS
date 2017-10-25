var TEXTS = [{
  title: 'Xingxiang',
  file: 'data/image_cn.txt',
  trigrams: 'data/theImage_cn-trigrams.js',
  mesostic: 'comes in is over goes out is done lolls in stays there is had no more'
}, {
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
  textLoaded = [TEXTS[0].title];

function loadTrigrams(callback) {

  var monitor = function (element, callback) {

    var self = element, h = self.clientHeight, w = self.clientWidth;
    var txt = self.innerText, html = self.innerHTML;
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

  if (typeof InstallTrigger !== 'undefined' && !location.href.includes('localhost')) {
    document.getElementById('overlay').innerHTML =  // tmp: Firefox
      "<br>Currently runs only on Chrome/Chromium/Opera/Safari</p>";
    window.mocha = 1; // disable p5.js
    return;
  }

  var menu = document.getElementById('interface'),
    overlay = document.getElementById('overlay');

  monitor(menu, function () {

    // fadeout overlay
    overlay.classList.toggle('fade', setTimeout(function () {

      // overlay.style.display = "none";
      var time = Date.now() - timerStart - 2000; // WHY -2000 ?
      console.log('[UI] Loaded (' + time + 'ms)');
      for (var i = 1; i < TEXTS.length; i++) { // skip the first text
        createScriptTag(TEXTS[i].trigrams, TEXTS[i].title);
      }
    }, 2000));
  });

  //createScriptTag('data/all-bigrams.js', 'Bigrams', callback); // load first
  createScriptTag(TEXTS[0].trigrams, TEXTS[0].title, callback); // load first
}

function createScriptTag(src, id, callback) {

  var finishLoading = function(text, callback) {

    textLoaded.push(text);
    var time = Date.now() - timerStart;

    console.log('[TRIGRAMS] ' + text + ' ' + time + 'ms');

    if (callback) callback();

    if (overlay.classList.value === "" && notify === text) {
      overlay.classList.toggle('fade');
      textChanged();
    }
  }

  var script = document.createElement("script");
  script.src = src;
  script.id = id;
  document.getElementsByTagName("head")[0].append(script);
  script.onload = function () {
    finishLoading(id, callback);
  };
}
