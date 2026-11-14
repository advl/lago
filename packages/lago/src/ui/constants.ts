import { tokens } from "@aztlan/tui";
import type { Status } from "../catalog/index.js";

/**
 * How each status is shown: a glyph and a word, in a colour that only
 * repeats them, so nothing is lost in a terminal that shows it otherwise.
 */
export const statusLooks = {
  pass: { glyph: "✓", word: "pass", color: tokens["color.text.success"] },
  new: { glyph: "+", word: "new", color: tokens["color.text.warning"] },
  changed: { glyph: "±", word: "changed", color: tokens["color.text.warning"] },
  error: { glyph: "✗", word: "error", color: tokens["color.text.error"] },
} as const satisfies Record<Status, unknown>;

/** The columns the tree takes, the gap after it included. */
export const treeColumns = 28;

/** The smallest terminal the gallery is drawn in, the size most stories are drawn at. */
export const minColumns = 80;
export const minLines = 24;

/** The pane's lines that are not the list region: the header, the counts, the status and the keys. */
export const chromeLines = 4;
