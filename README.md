# ReadersJS

<img width="897" height="255" alt="image" src="https://github.com/user-attachments/assets/9fb48e67-29b4-4a6e-bb36-bb414bebb625" />

To Install:

```$ npm install```

<br>

To Run:

```open index.html in a browser (using a local server is advisable)```

<br>

To configure the readers window from the URL, add query parameters, e.g.

```index.html?text=The Image&theme=Light&readers=PerigramReader,MesosticJumper&focus=MesosticJumper```

* text: any title in TEXTS (src/text-loader.js), so new texts are accepted automatically<br>
* style: Grey, Faint or Invisible<br>
* theme: Dark or Light<br>
* readers: comma-separated reader types to enable: PerigramReader, ObliquePerigramReader, SpawningSimpleReader, SpawningPerigramReader, MesosticJumper or SimpleReader (which is off by default and not in the menu, see [Readers and their default speeds](#readers-and-their-default-speeds))<br>
* focus: reader type to give focus (it is enabled if not listed in readers)<br>
* solo: a single reader type to run on its own<br>
* speed: Fluent, Steady, Slow, Slower, Slowest or Fast, for all readers and/or per reader, e.g. speed=Slow,MesosticJumper:Fast<br>
* fontsize: font size in px (6 to 120) for every text, e.g. fontsize=20<br>
* leading: line spacing in px (6 to 240) for every text, e.g. leading=26 (see [Typesetting](#typesetting))

<sup>* Name are case-insensitive and ignore spaces, hyphens and underscores; unknown values are ignored with a console warning (see src/url-params.js)</sup>

<br>

To show only the readers window (no interface), add the fullscreen parameter, e.g.

```index.html?fullscreen&text=The Image```

The canvas is centered at its normal size; browsers require a user gesture, so full screen begins on the first click or keypress

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

**Limitations.** The text is drawn on the canvas, so it scales with it: on a phone in portrait the readers are very small, and landscape is much better. A true reflow (e.g. a single narrow page for portrait) would mean re-running `pManager.layout()` with new dimensions and repositioning the readers (as `resetText()` in `src/multi-page.js` does).

<br>

## Reading time

How long a reader stays on a word is its estimated reading time, from the `timeToRead.js` estimator in the [scoringthespeltair](https://github.com/observable2/scoringthespeltair) library (shared with our other "spel" projects). Each step, a reader waits `wordTime(word) + whitespaceTime(" ")` milliseconds, divided by a **factor** set by its speed (see `Reader.stepTimeFor()` in `src/readers-app.js`):

| Speed | Fluent | Steady | Slow | Slower | Slowest | Fast |
|---|---|---|---|---|---|---|
| factor (`0.4 / speed`) | 1 | 0.5 | 0.33 | 0.25 | 0.2 | 2 |

At factor 1 the estimator's own pace is used unchanged. 

Notes:
* `whitespaceTime(" ")` is 0 with the library's current defaults, so `step` is the word time alone. 
* A word that gets no time from the estimator (e.g. a bare `<p/>` token) waits `Reader.MIN_STEP_MS` (50 ms).
* The estimator is an ES module loaded with a `<script type="module">` (`src/reading-time.js`, which sets `window.ReadingTime`) and **needs the page to be served over http** (as the texts already do). If its missing, a warning is logged and readers fall back to `speed` x 1000 ms.
* The per-reader fade times are derived from the step time following the estimate. Fade delays using `speed` directly (e.g. `PerigramReader`) are unchanged.

### Updating the "timetoread" library

The library is **copied into this project** (`lib/scoringthespeltair/timetoread.js` and `markup.js`) rather than  installed. `lib/versions.txt` records which commit the lib came from. To take in new development:

1. In the library's own repo, commit the change 
2. Here, run `scripts/sync-scoringthespeltair.sh` (it defaults to the copy under `John_adxd26fall`; pass another clone's path, or set `SCORINGTHESPELTAIR`, to use a different one). It copies the two files and updates the commit line in `lib/versions.txt`.
3. Check `git diff lib/`, reload `index.html` and check the readers' pace, then commit the new copy.

Never edit the files in `lib/scoringthespeltair/` here - fix them in the library and sync. If the library adds a file that `timetoread.js` imports, add it to `FILES` in the script. If the library changes the names or arguments of `wordTime` / `whitespaceTime`, update `src/reading-time.js` and `Reader.stepTimeFor()`. If the *factors* change meaning (e.g. the default pace is recalibrated), the speed presets move with it, so re-run a comparison like the one above and adjust `Reader.READING_SPEED`.
