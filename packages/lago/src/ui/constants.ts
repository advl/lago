import type { Tokens } from "@aztlan/tui";
import type { Status } from "../catalog/index.js";

/**
 * How each status is shown: a glyph and a word, in a colour that only
 * repeats them, so nothing is lost in a terminal that shows it otherwise.
 * The colour is named by its token and read from the tokens the gallery is
 * drawn under.
 */
export const statusLooks = {
  pass: { glyph: "✓", word: "pass", color: "color.text.success" },
  new: { glyph: "+", word: "new", color: "color.text.warning" },
  changed: { glyph: "±", word: "changed", color: "color.text.warning" },
  error: { glyph: "✗", word: "error", color: "color.text.error" },
} as const satisfies Record<
  Status,
  { glyph: string; word: string; color: keyof Tokens }
>;

/** The columns the tree takes, the gap after it included. */
export const treeColumns = 28;

/** The smallest terminal the gallery is drawn in, the size most stories are drawn at. */
export const minColumns = 80;
export const minLines = 24;

/** The pane's lines that are not the list region: the header, the counts, the status and the keys. */
export const barLines = 4;
