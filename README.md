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

<br>

## Responsive display

The display now adapts to the size of the browser window (desktop, tablet and phone), without changing how the readers behave.

**Approach.** This is the same "scale the fixed stage with CSS" method used for the sibling `overboard` and `translation` pieces (see their READMEs), adapted here because ReadersJS also has an options button, an instruction line and a focus panel around the stage. The text layout and every reader (grids, neighbourhoods, positions) work in a fixed 1280 x 720 coordinate space, so reflowing the text for each window size would risk changing the readers' behaviour. Instead the p5 canvas keeps its 1280 x 720 internal size and is scaled by CSS to fit the window, keeping its 16:9 proportions. Reading logic is untouched, and the fixed-size `min-width` that forced scrolling has been removed.

What changes with the window (see `style.css`, where the sizes are CSS variables at the top):

* **Canvas**: scales down to fit both the width and the height of the window (never larger than 1280 px wide, except in `?fullscreen` mode, where it fills the window, letterboxed to 16:9). Sizes are set only in CSS (`!important`, to beat the inline pixel sizes p5 writes), using `dvh` where supported so mobile browser toolbars are accounted for.
* **Crispness** (`stageDensity()` in `src/multi-page.js`): p5's `pixelDensity` is set to `devicePixelRatio` x the displayed scale (rounded up to the nearest 0.5, clamped to 1-3), so the scaled text stays sharp on hi-DPI and upscaled (`?fullscreen`) displays.
* **Resizing** (`windowResized()`): the density is re-evaluated 200 ms after resizing settles, since changing it reallocates the canvas. Readers, timing and state are unaffected.
* **Focus display** (right-hand panel): narrower on small windows; under 1100px wide it starts collapsed so it doesn't cover the readers (click "Focused Reader" to open it). On very wide windows (1800px+) it sits beside the canvas.
* **Options menu**: fills the window width on phones, and scrolls if the window is short.
* **Loading overlay**: centered rather than placed at a fixed pixel offset.
* **Phones in landscape / short windows**: the header shrinks to leave more room for the canvas.
* **Touch**: swipe left/right on the canvas to turn pages (the equivalent of the arrow keys); see `addSwipePaging()` in `src/multi-page.js`.
* `index.html` now has a viewport meta tag (`width=device-width, initial-scale=1, viewport-fit=cover`), so mobile browsers use the real device width. The canvas has `touch-action: pan-y` so vertical scrolling still works while horizontal swipes turn pages.

**Limitations.** The text is drawn on the canvas, so it scales with it: on a phone in portrait the readers are very small, and landscape is much better. A true reflow (e.g. a single narrow page for portrait) would mean re-running `pManager.layout()` with new dimensions and repositioning the readers (as `resetText()` in `src/multi-page.js` does), and has not been attempted. Unlike `overboard` and `translation`, the canvas is not pinned to the whole viewport, because the surrounding interface shares the window with it.

**Testing.** Checked in headless Chrome at roughly 1900x700, 1400x900, 1000x700, 667x375 and 390x800 (the last two in an iframe), with the options menu open and closed. The pixel-density change was checked in `?fullscreen` at 1900x1013 (density 1.5, 1920x1080 backing store, no errors); headless Chrome would not load the page at a device pixel ratio of 2, so hi-DPI screens are untested. Real-device testing, especially of swipe paging, iOS Safari (toolbar/`dvh` behaviour) and a window resize while the readers are running, is still welcome.
