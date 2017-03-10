var pManager, rdr, font, bgColor = 0;
var TEXTS = ["data/image.txt", "data/poeticCaption.txt", "data/misspeltLandings.txt"],
    READER_NAMES = ["Mesostic Reader", "Perigram Reader", "Less Directed Perigram Reader", "Simple Spawner Reader", "Perigram Spawner Reader", "Less Directed Spawner Reader"],
    TEXT_NAMES = [ "THE IMAGE", "POETIC CAPTION", "MISSPELT LANDINGS"],
    TEXT_STYLES = [ "Faint", "Grey", "Dark"],
    COLOR_THEMES = ["Dark", "Light"],
    SPEED_MODES = ["Fluent", "Steady", "Slow", "Slower", "Slowest", "Fast"];

//Color Reference in Java
//White
//Brown 79, 34, 0
//Ochre 216, 129, 0
//Orange 0xFFB01C
//Yellow 0xFFD000

function preload() {

  bg = loadImage('data/page.png');
  font = loadFont('fonts/Baskerville.ttf');
}

function setup() {

  createCanvas(1280, 720);

  RiText.defaultFill(255,60);
  RiText.defaultFont(font, 24);
  RiText.defaults.paragraphIndent = 20;

  //Load other two text as well
  RiTa.loadString('data/image.txt', function (txt) {

    // do the layout
    pManager = PageManager.getInstance(Reader.APP);
    pManager.storePerigrams(3, trigrams);
    pManager.layout(txt, 25, 40, 580, 650); // grid-rect

    // add some readers

    rdr = new Reader(pManager.recto, 1, 8, .4);
    rdr = new PerigramReader(pManager.recto);
    rdr = new MesosticReader(pManager.verso, 1.1);

    // set page-turner/logger
    pManager.focus(rdr);

    //Interface
    
    // 6 Readers
    // checkbox + select
    var readersOptions = {};
    for( var i = 0; i < READER_NAMES.length; i++ ) {
      
      var idName = READER_NAMES[i].replace(/ /g, "");

      rb = createCheckbox(READER_NAMES[i], false);
      rb.changed(readerOnOffEvent);
      rb.id(idName);
      select = initializeSelect(SPEED_MODES, speedChanged);

      readersOptions[READER_NAMES[i]] = {
        active : false,
        radioButton : rb,
        speedSelect : select
      }
      
      select.parent(rb);
      rb.class("reader");
      rb.parent('interface');
     
    }


    focusSelect = initializeSelect(READER_NAMES, focusChanged);
    titleSelect = initializeSelect(TEXT_NAMES, textChanged);
    styleSelect = initializeSelect(TEXT_STYLES, styleChanged);
    themeSelect = initializeSelect(COLOR_THEMES, themeChanged);
    styleSelect.addClass("half");
    themeSelect.addClass("half");
     
    button = createButton('go');
    button.mousePressed(selectionDone);
    button.id('go');
    
    //Append all elements to interface
    var interfaceElements = [focusSelect, titleSelect, styleSelect, themeSelect, button];
    var discriptText = ["Focus","Title", "Style", "Theme"]
    for ( var i = 0; i < interfaceElements.length; i++ ) {
      if (i != interfaceElements.length -1) {
        wrapper = createDiv("");
        wrapper.addClass("item");
        wrapper.parent('interface');
        discription = createP(discriptText[i]);
        discription.parent(wrapper);
        interfaceElements[i].parent(wrapper);

      } else 
        interfaceElements[i].parent('interface');
    }
      


  });
}


function draw() {

  background(bgColor);
	pManager && (pManager.draw());

}

function keyPressed() {

	keyCode == 39 && (pManager.nextPage());
	keyCode == 37 && (pManager.lastPage());
}

/***************** INTERFACE ***********************/

function initializeSelect(options, event, bind) {

    var sel = createSelect();

    for (var i = 0; i < options.length; i++)
        sel.option(options[i]);

    sel.changed(event);
    return sel;

}

function focusChanged() {
    //TODO: hide readers options that are not active
    var focus = focusSelect.value();
    console.log(focus);
    //pManager.focus(rdr);
}

function textChanged() {
  
    var textName = textSelect.value();
    console.log(textName);
    //TODO: store all the texts in setup
    // pManager.layout(txt, 25, 40, 580, 650);
}

function styleChanged() {
  
    var style = styleSelect.value();
  
    var alpha;
    switch (style) {
        case "Faint":
           alpha = 40;
        case "Grey":
           alpha = 70;
        case "Dark":
           alpha = 0;
    }
    console.log(style, alpha);
    
    //TODO: change text alpha - Grid?
}

function themeChanged() {

   var theme = themeSelect.value();
   if (theme === "Dark") {
       //change default text color to 255
       //change reader color scheme
   } else {
     
       //change text color to 0
       //change reader color scheme
   }

}

function readerOnOffEvent() {
    console.log(this.checked());
}

function speedChanged() {
   // console.log(this.elt.value);
   console.log(this.parent().id);
}

function selectionDone(){
   $('#interface').hide();
}