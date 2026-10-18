// Reduces text that may contain HTML and/or Markdown to plain text that can be measured for
// reading time. Dependency-free, and a pragmatic subset of both syntaxes, not full parsers.
// Internal to the library (used by timetoread.js; not a public subpath export).
//
// The result keeps whitespace as private-use marker characters so the next stage can tell
// the kinds apart. Written as \u escapes so an editor can't silently change them.
const BRK = "\ue000"; // structural line break: block tag, <br>, Markdown paragraph/heading/item/hard break
const RSP = "\ue001"; // space character that is always respected (&nbsp;, <pre>, code fence, ...)
const RTAB = "\ue002"; // tab character that is respected
const RNL = "\ue003"; // newline that is respected
// an ordinary (collapsible) space stays a plain " "

const ENTITIES = {
  nbsp: "\u00a0", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  ndash: "\u2013", mdash: "\u2014", hellip: "\u2026",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d"
};

function decodeEntities(s) {
  return s.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));/g, (whole, dec, hex, name) => {
    if (name) return Object.hasOwn(ENTITIES, name) ? ENTITIES[name] : whole; // unknown names are left as they are
    const cp = dec ? parseInt(dec, 10) : parseInt(hex, 16);
    return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : "";
  });
}

// whitespace that must be kept exactly (inside <pre> and code fences)
const respect = (s) => s.replace(/ /g, RSP).replace(/\t/g, RTAB).replace(/\n/g, RNL);

const BLOCK_TAGS =
  /<\/?(?:address|article|aside|blockquote|br|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|summary|table|tbody|thead|tfoot|tr|ul)\b[^>]*>/gi;

function htmlBefore(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre\s*>/gi, (_, inner) => BRK + respect(inner.replace(/^\n/, "")) + BRK);
}

function htmlAfter(s) {
  return decodeEntities(
    s
      .replace(BLOCK_TAGS, BRK)
      .replace(/<\/?(?:td|th)\b[^>]*>/gi, " ") // cells are separated, but are not line breaks
      .replace(/<\/?[A-Za-z][^>]*>/g, "") // any other tag: inline, adds nothing
  );
}

const LINK_TARGET = String.raw`\((?:[^()\s]|\([^()]*\))*(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)`;

function markdown(s) {
  const lines = s.split("\n");
  const pieces = []; // [text of the line, what follows it]; no separator after the last line
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (fence) {
      const close = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) {
        fence = null;
        pieces.push([BRK, "\n"]);
      } else pieces.push([respect(line), RNL]); // code keeps its whitespace
      continue;
    }
    const open = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (open) { fence = open[1]; pieces.push([BRK, "\n"]); continue; }
    // a blank line is a paragraph break only between two newlines; elsewhere it is just whitespace
    if (/^\s*$/.test(line)) { pieces.push([i > 0 && i < lines.length - 1 ? BRK : "", "\n"]); continue; }
    // rule, setext underline, table divider: a break, nothing to read
    if (
      /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line) ||
      /^\s{0,3}(=+|-+)\s*$/.test(line) ||
      (/^[\s|:-]+$/.test(line) && line.includes("|") && line.includes("-"))
    ) { pieces.push([BRK, "\n"]); continue; }
    if (/^\s{0,3}\[[^\]\n]+\]:\s*\S/.test(line)) { pieces.push(["", "\n"]); continue; } // link reference definition
    let before = "", after = "";
    while (/^\s{0,3}>/.test(line)) line = line.replace(/^\s{0,3}>\s?/, ""); // block quote
    const heading = line.match(/^\s{0,3}#{1,6}(?:\s+|$)/);
    if (heading) {
      line = line.slice(heading[0].length).replace(/\s+#+\s*$/, "");
      before = after = BRK;
    } else {
      const item = line.match(/^\s*(?:[-+*]|\d{1,9}[.)])\s+(?:\[[ xX]\]\s+)?/);
      if (item) { line = line.slice(item[0].length); before = BRK; }
    }
    if (/( {2,}|\\)$/.test(line) && i + 1 < lines.length && !/^\s*$/.test(lines[i + 1])) {
      line = line.replace(/( {2,}|\\)$/, ""); // hard line break
      after += BRK;
    }
    if ((line.match(/\|/g) || []).length >= 2 || /^\s*\|/.test(line)) line = line.replace(/\|/g, " "); // table row
    line = line
      .replace(new RegExp(String.raw`!\[[^\]]*\]` + LINK_TARGET, "g"), "") // image: nothing to read
      .replace(new RegExp(String.raw`\[([^\]]*)\]` + LINK_TARGET, "g"), "$1") // link: keep the text, not the target
      .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1") // reference link
      .replace(/\[\^[^\]]+\]/g, "") // footnote marker
      .replace(/<https?:\/\/[^>\s]+>/g, "") // autolink
      .replace(/\\([!-\/:-@\[-`{-~])/g, "$1"); // backslash escape
    pieces.push([before + line + after, "\n"]);
  }
  return pieces.map(([text, sep], i) => (i < pieces.length - 1 ? text + sep : text)).join("");
}

// text -> plain text with whitespace kept as markers
//   html, markdown: strip that kind of markup (both on by default in timetoread.js)
//   whitespace: "collapse" (default DOM/Markdown rendering: runs of space, tab, newline are one
//               ordinary space) or "respect" (as with CSS white-space: pre; every one counts)
function flatten(text, { html = true, markdown: md = true, whitespace = "collapse" } = {}) {
  let s = String(text ?? "").replace(/[\ue000-\ue003]/g, "").replace(/\r\n?/g, "\n");
  if (html) s = htmlBefore(s);
  if (md) s = markdown(s);
  if (html) s = htmlAfter(s);
  s = s.replace(/\u00a0/g, RSP);
  if (whitespace === "respect") return s.replace(/ /g, RSP).replace(/\t/g, RTAB).replace(/\n/g, RNL).replace(/[\f\v]/g, RSP);
  return s.replace(/[ \t\n\f\v]+/g, " ");
}

export { flatten, BRK, RSP, RTAB, RNL };
