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
readers: comma-separated reader types to enable (all others are turned off): PerigramReader, ObliquePerigramReader, SpawningSimpleReader, SpawningPerigramReader, MesosticJumper or SimpleReader (which is off by default and not in the menu, see [Readers and their default speeds](#readers-and-their-default-speeds))<br>
focus: reader type to give focus (it is enabled if not listed in readers)<br>
solo: a single reader type to run on its own<br>
speed: Fluent, Steady, Slow, Slower, Slowest or Fast, for all readers and/or per reader, e.g. speed=Slow,MesosticJumper:Fast<br>
fontsize: font size in px (6 to 120) for every text, e.g. fontsize=20<br>
leading: line spacing in px (6 to 240) for every text, e.g. leading=26 (see [Typesetting](#typesetting))

Names are case-insensitive and ignore spaces, hyphens and underscores; unknown values are ignored with a console warning (see src/url-params.js)

<br>

To show only the readers window (no interface), add the fullscreen parameter, e.g.

index.html?fullscreen&text=The Image

The canvas is centered at its normal size; browsers require a user gesture, so true full screen begins on the first click or keypress

<br>

## Readers and their default speeds

Each reader has its own speed, which sets how long it stays on each word (see [Reading time](#reading-time) for how a speed becomes a time). Speeds are the presets in `SPEED` (`src/multi-page-ui.js`): Fast 0.2, Fluent 0.4, Steady 0.8, Slow 1.2, Slower 1.6, Slowest 2.0. The larger the number, the slower the reader. A reader's reading-time factor is `0.4 / speed`.

| Reader | Default speed | Factor | Where it is set |
|---|---|---|---|
| PerigramReader | Fluent (0.4) | 1 | passed in `setup()` (`src/multi-page.js`) and its own default |
| ObliquePerigramReader | Steady (0.8) | 0.5 | its own default |
| SpawningSimpleReader | Fluent (0.4) | 1 | its own default |
| SpawningPerigramReader | Fluent (0.4) | 1 | its own default |
| MesosticJumper | Steady (0.8) | 0.5 | no default of its own, so it takes the base `Reader` default |
| SimpleReader (URL only, off by default) | Fluent (0.4) | 1 | inherited from SpawningSimpleReader |
| OnewayPerigramReader | Fast (0.2) | 2 | passed by the spawning readers, which create it for a short run |

**Where readers start.** Most readers start at the top left of a page. The ObliquePerigramReader starts on the verso, two words in and three quarters of the way down (line `floor(0.75 x number of lines)`, so it follows the text's typesetting), and the SimpleReader at the top left of the verso. Both return there when the text changes. A reader's starting cell is its `startCell(grid)` method (default `{x: 0, y: 0}`; see `ObliquePerigramReader.START_WORD` and `START_DOWN`).

**SimpleReader** is a SpawningSimpleReader that never spawns (`src/simple-reader.js`): it has the same path and fades but creates no one-way readers. It is floral white (`#FFFAF0`; a warm near-black, `#3B3228`, in the light theme so that it shows), and it starts at the top left of the verso page, returning there whenever the text changes. It is available only through the URL and is off unless you ask for it: `?readers=SimpleReader` (alone, or with others in the list), `?focus=SimpleReader` (turns it on and gives it focus, leaving the others on) or `?solo=SimpleReader`. It has no row in the options menu (its row exists but is hidden by `style.css`, because the URL, focus and solo code find a reader's controls by its type). Its colour follows the theme (floral white, or the warm near-black on the light theme).

These are starting values only. Change a reader's speed with its dropdown in the options menu, with the `speed` URL parameter (e.g. `speed=Slow,MesosticJumper:Fast`), or in code with the constructor's last argument or `reader.speed` (any number is accepted, and it is read on every step).

<br>

## Typesetting

The font size and the leading (line spacing, both in px) can be set per text, and for all texts from the URL. The page box (position and size of the two pages) and the font family are the same for every text.

* **Per text:** add `fontSize` and/or `leading` to the text's entry in `TEXTS` (`src/text-loader.js`), e.g. `{ title: 'The Image', ..., fontSize: 20, leading: 26 }`.
* **From the URL:** `?fontsize=20&leading=26` applies to every text and overrides the text's own values (`fontSize` is also accepted). Values outside the ranges above, or that aren't numbers, are ignored with a console warning.
* **Defaults:** font size 24 (`DEFAULT_FONT_SIZE` in `src/multi-page.js`). If no leading is given it follows the font size (size x 1.2, so 28.8 px at 24), so a text or URL that changes only `fontSize` keeps proportional line spacing. Texts with neither setting look as they always did. **Misspelt Landings** is set to font size 21.4, leading 25.6 (just under the usual 1.2): the largest size that fits the whole text on a single opening (verso and recto, 26 + 25 lines) at about that leading, with one line to spare on the recto as a margin for browsers that measure the text slightly wider. Larger sizes leave no margin, or only fit with tighter leading, and the leading can't go above about 25.7 without losing the spare line.

The values are applied whenever a text is laid out (at startup, and whenever another text is chosen), by `layoutText()` in `src/multi-page.js`; the precedence is URL, then the text's own value, then the default.

A smaller font or tighter leading fits more words on each page; a larger one fewer. Layout throws "No enough text for multi-page layout" if the text can't fill the pages, so a very large size can fail on a short text. At the default box, `fontsize=18` gives 30 lines a page for Misspelt Landings (26 at its own size of 21.4, 23 at 24, which needs a third page).

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

<br>

## Reading time

How long a reader stays on a word is its estimated reading time, from the `timeToRead.js` estimator in the [scoringthespeltair](https://github.com/observable2/scoringthespeltair) library (shared with our other "spel" projects). Each step, a reader waits `wordTime(word) + whitespaceTime(" ")` milliseconds, divided by a **factor** set by its speed (see `Reader.stepTimeFor()` in `src/readers-app.js`):

| Speed | Fluent | Steady | Slow | Slower | Slowest | Fast |
|---|---|---|---|---|---|---|
| factor (`0.4 / speed`) | 1 | 0.5 | 0.33 | 0.25 | 0.2 | 2 |

At factor 1 the estimator's own pace is used unchanged. This replaces the earlier rule (`speed` x 1000 ms, scaled up 10% per letter after the first); there is no fixed-time option any more.

**Why this was safe to switch to.** Fluent was the reference, so the change was checked against it: over the three texts (2,202 words) the old Fluent step averaged 537 ms and the estimator at factor 1 averages 492 ms (0.92x; 0.97x and 0.98x on the two poems), and they correlate at r = 0.98 word by word. The pace is therefore much the same; the difference is in the detail: short words are quicker (1-2 letters: 202 ms vs 432), long words slower (10+ letters: 1249 ms vs 812), and punctuated words get a pause (740 ms vs 612), which the old rule did not do.

Notes:

* `whitespaceTime(" ")` is 0 with the library's current defaults (a single space is already inside the per-letter cost), so today the step is the word time alone. It is in the formula so that any future tuning in the library takes effect here.
* A word that gets no time from the estimator (e.g. a bare `<p/>` token) waits `Reader.MIN_STEP_MS` (50 ms) so it can't spin the timer.
* The estimator is an ES module, so it is loaded with a `<script type="module">` (`src/reading-time.js`, which sets `window.ReadingTime`) and **needs the page to be served over http** (as the texts already do). If it is missing, a warning is logged and readers fall back to `speed` x 1000 ms.
* The per-reader fade times are derived from the step time, so they follow the estimate. Fade delays that use `speed` directly (e.g. `PerigramReader`) are unchanged.

### Updating the vendored library

The library is **copied into this project** (`lib/scoringthespeltair/timetoread.js` and `markup.js`), not installed, so a change in the library never reaches the readers by itself. `lib/versions.txt` records which library commit the copy came from. To take in new development:

1. In the library's own repo, commit the change (the sync script warns if `timetoread.js` or `markup.js` has uncommitted edits, because the recorded commit would then not match the copy).
2. Here, run `scripts/sync-scoringthespeltair.sh` (it defaults to the copy under `John_adxd26fall`; pass another clone's path, or set `SCORINGTHESPELTAIR`, to use a different one). It copies the two files and updates the commit line in `lib/versions.txt`.
3. Look at `git diff lib/` (what changed in the estimator), reload `index.html` and check the readers' pace, then commit the new copy with the library's commit hash in the message.

Never edit the files in `lib/scoringthespeltair/` here: the next sync would overwrite the edit. Fix them in the library and sync. If the library adds a file that `timetoread.js` imports, add it to `FILES` in the script. If the library changes the names or arguments of `wordTime` / `whitespaceTime`, update `src/reading-time.js` and `Reader.stepTimeFor()`. If the *factors* change meaning (e.g. the default pace is recalibrated), the speed presets move with it, so re-run a comparison like the one above and adjust `Reader.READING_SPEED`.
