# ReadersJS

<br>

To Install:

$ npm install

<br>

To Run:

open index.html in a browser (using a local server is advisable)

<br>

To configure the readers window from the URL, add query parameters, e.g.

index.html?text=The Image&theme=Light&readers=PerigramReader,MesosticJumper&focus=MesosticJumper

text: any title in TEXTS (src/text-loader.js), so new texts are accepted automatically<br>
style: Grey, Faint or Invisible<br>
theme: Dark or Light<br>
readers: comma-separated reader types to enable (all others are turned off): PerigramReader, ObliquePerigramReader, SpawningSimpleReader, SpawningPerigramReader or MesosticJumper<br>
focus: reader type to give focus (it is enabled if not listed in readers)<br>
solo: a single reader type to run on its own<br>
speed: Fluent, Steady, Slow, Slower, Slowest or Fast, for all readers and/or per reader, e.g. speed=Slow,MesosticJumper:Fast

Names are case-insensitive and ignore spaces, hyphens and underscores; unknown values are ignored with a console warning (see src/url-params.js)

<br>

To show only the readers window (no interface), add the fullscreen parameter, e.g.

index.html?fullscreen&text=The Image

The canvas is centered at its normal size; browsers require a user gesture, so true full screen begins on the first click or keypress
