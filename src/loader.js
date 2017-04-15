var timerStart = Date.now();

function loadTexts() {

  var menu = document.getElementById('interface'),
    overlay = document.getElementById('overlay');

  function monitor(element, callback) {
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
      console.log('[LOAD] ' + TEXTS[0].title + ' ' + time + 'ms');
      reloadTheRest();

    }, 2000));
  });
}

function finishLoading(text) {

  textLoaded.push(text);
  var time = Date.now() - timerStart;
  console.log('[LOAD] ' + text + ' ' + time + 'ms');

  if (overlay.classList.value === "" && notify === text) {
    overlay.classList.toggle('fade');
    textChanged();
  }
}

function reloadTheRest() {

  var trigramScripts = {
    'Poetic Caption': "data/poeticCaption-trigrams.js",
    'The Image': "data/theImage-trigrams.js"
  }

  for (key in trigramScripts) {
    var script = document.createElement("script"),
      html = document.getElementsByTagName("html")[0];

    script.src = trigramScripts[key];
    script.id = key;

    html.appendChild(script);
    script.onload = function () {
      finishLoading(this.id);
    };
  }
}

window.onload = loadTexts;
