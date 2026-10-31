// Bridges the vendored scoringthespeltair reading-time estimator (an ES module,
// see lib/scoringthespeltair/ and README "Reading time") to the classic
// scripts used by the rest of the app, as window.ReadingTime.
import { wordTime, whitespaceTime } from "../lib/scoringthespeltair/timetoread.js";

window.ReadingTime = { wordTime: wordTime, whitespaceTime: whitespaceTime };
