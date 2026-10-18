// Dependency-free reading-time estimates, in milliseconds. See timetoread-rita.js for the
// RiTa-based model. Provisional constants: to be recalibrated against recorded readings
// (see README "Calibration"). Characters are written as \u escapes so an editor can't
// silently change them.
//
//   timeToRead(text, factor, options)   any amount of text, from one token up
//   wordTime(token, factor, options)    one whitespace-delimited token
//   whitespaceTime(gap, factor, options) the whitespace between two tokens
//
// Text may contain HTML and/or Markdown (see markup.js); markup is not read, and block
// structure (paragraphs, <br>, headings, list items, ...) becomes line breaks.
//
// word time  = base + perLetter * letters + clausePause * clause marks + sentencePause * sentence marks
// gap time   = perNewline * line breaks + perSpace * extra spaces + perTab * extra tabs
// Everything is divided by `factor` (> 1 reads faster, < 1 slower) and rounded to a whole ms.
//
// Only the punctuation listed here is accounted for; the set is to be developed later.
// The end of the text supplied is treated as a line ending, whether or not it is a real end:
// one line break, or two if the text contains some other line break (endBreaks, endBreaksMultiline).
import { flatten } from "./markup.js";

const defaults = Object.freeze({
  base: 0,
  perLetter: 112, // ordinary single spacing between words is already inside this figure
  clausePause: 150, // per , ; : and dashes, closing curly quote and ) (not yet calibrated: no data)
  sentencePause: 150, // per . ? ! and ellipsis (not yet calibrated: no data)
  perSpace: 75, // per respected space beyond the ordinary one between words (not yet calibrated)
  perTab: 300, // per respected tab (not yet calibrated)
  perNewline: 1000, // per line break; measured at about +1000 ms in reunion
  endBreaks: 1, // line breaks the end of the text counts as ...
  endBreaksMultiline: 2, // ... or this many when the text has another line break (not yet calibrated)
  html: true, // strip HTML tags, decode entities
  markdown: true, // strip Markdown
  whitespace: "collapse" // "collapse": as the DOM and Markdown render; "respect": as with white-space: pre
});

const count = (s, re) => (s.match(re) || []).length;

function settings(options) {
  const o = { ...defaults, ...options };
  if (o.whitespace !== "collapse" && o.whitespace !== "respect") {
    throw new Error(`timeToRead: whitespace must be "collapse" or "respect", not ${JSON.stringify(o.whitespace)}`);
  }
  return o;
}

// markers left by flatten(): a gap is any run of ordinary spaces and whitespace markers
const GAPS = /([ \ue000-\ue003]+)/;

function wordMs(token, o, factor) {
  const ms =
    o.base +
    o.perLetter * count(token, /\p{L}/gu) +
    o.clausePause * count(token, /[,;:\u2014\u2013\u201d)]/g) +
    o.sentencePause * count(token, /[.?!\u2026]/g);
  return Math.round(ms / factor);
}

// line breaks in a (flattened) gap. Structural breaks count as "at least one"; a leading
// one starts the text and is not a pause.
function breaksIn(gap, leading) {
  const newlines = count(gap, /\ue003/g);
  const structural = count(gap, /\ue000/g);
  return leading ? newlines : Math.max(newlines, structural > 0 ? 1 : 0);
}

// `gap` is already flattened. leading: before the first word. endBreaks: the gap that ends
// the text coincides with the end-of-text line break, which is worth at least this many.
function gapMs(gap, o, factor, { leading = false, endBreaks = 0 } = {}) {
  const ordinary = count(gap, / /g);
  const spaces = count(gap, /\ue001/g);
  const tabs = count(gap, /\ue002/g);
  let breaks = breaksIn(gap, leading);
  let extraSpaces = spaces;
  // between words one space is the ordinary separator, already inside perLetter
  if (!leading && breaks === 0 && ordinary === 0 && spaces > 0) extraSpaces -= 1;
  breaks = Math.max(breaks, endBreaks);
  return Math.round((o.perNewline * breaks + o.perSpace * extraSpaces + o.perTab * tabs) / factor);
}

// reading time of one token (markup allowed), not including the whitespace after it
function wordTime(token, factor = 1, options = {}) {
  const o = settings(options);
  return wordMs(flatten(token, o).replace(/[ \ue000-\ue003]/g, ""), o, factor);
}

// time for the whitespace (and any markup) between two tokens
function whitespaceTime(gap, factor = 1, options = {}) {
  const o = settings(options);
  return gapMs(flatten(gap, o), o, factor);
}

// reading time of a text of any length, from one token up
function timeToRead(text, factor = 1, options = {}) {
  const o = settings(options);
  const parts = flatten(text, o).split(GAPS); // [token, gap, token, gap, ..., token]; ends may be ""
  const lastGap = parts[parts.length - 1] === "" ? parts.length - 2 : -1; // index of a gap that ends the text
  // does the text contain a line break other than the one that ends it?
  let words = 0;
  let interior = false;
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      if (part) words++;
    } else if (i !== lastGap && breaksIn(part, words === 0) > 0) interior = true;
  });
  if (words === 0) return 0;
  const endBreaks = interior ? o.endBreaksMultiline : o.endBreaks;
  let ms = 0;
  let seen = 0;
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i]) {
      ms += wordMs(parts[i], o, factor);
      seen++;
    }
    if (i + 1 < parts.length) {
      ms += gapMs(parts[i + 1], o, factor, { leading: seen === 0, endBreaks: i + 1 === lastGap ? endBreaks : 0 });
    }
  }
  if (lastGap === -1) ms += gapMs("", o, factor, { endBreaks }); // no final gap: the end itself is the break
  return ms;
}

export { timeToRead, wordTime, whitespaceTime, defaults as timeToReadDefaults };
