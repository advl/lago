import type { FitRules } from "./types.js";

/**
 * How each kind of text is fitted to each slot, unless a caller passes a
 * table of its own. An identifier's end carries its meaning, the number of
 * `example#12` or a path's last part, so it is cut in its middle. A figure
 * is never cut: the slot that holds it leaves it room. An application adds
 * its own kinds by spreading this table into one of its own.
 */
export const fitRules: FitRules = {
  identifier: { line: "cutMiddle", block: "wrap" },
  title: { line: "cutEnd", block: "wrap" },
  quote: { line: "cutEnd", block: "wrap" },
  words: { line: "cutEnd", block: "wrap" },
  reason: { line: "cutEnd", block: "wrap" },
  recovery: { line: "cutEnd", block: "wrap" },
  figure: { line: "whole", block: "whole" },
};

/** One printable ASCII character, which takes one cell. */
export const ascii = /^[\x20-\x7e]$/;

/** Text of printable ASCII only, which takes one cell a character. */
export const asciiText = /^[\x20-\x7e]*$/;

/** Splits text into what a reader sees as one character each. */
export const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });

/**
 * A space that joins two words so no line breaks between them: a caller
 * puts it between the words of a name or a command it wants kept on one
 * line, and wrapping draws it as an ordinary space.
 */
export const noBreakSpace = " ";
