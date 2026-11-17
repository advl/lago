import type { Mark } from "./types.js";

/** The widest the column of stories' names grows, its mark included. */
export const labelColumns = 28;

/** The narrowest a cell's column is, and the widest it grows for a mode's name, the gap after it included. */
export const cellColumns = { least: 5, most: 11 } as const;

/** What a cell shows where its story has no picture: left out by its file, or not drawn there at all. */
export const absentMarks = {
  leftOut: { glyph: " ", word: "left out", color: "color.text.muted" },
  notDrawn: { glyph: " ", word: "not drawn", color: "color.text.muted" },
} as const satisfies Record<string, Mark>;

/** The legend under the matrix, each glyph with its words, in the order a cell's state is ranked. */
export const legend: readonly Mark[] = [
  { glyph: "✓", word: "pass", color: "color.text.success" },
  { glyph: "±", word: "changed", color: "color.text.warning" },
  { glyph: "+", word: "new", color: "color.text.warning" },
  { glyph: "=", word: "equal to the base", color: "color.text.muted" },
  { glyph: "!", word: "expected but equal", color: "color.text.error" },
  { glyph: "✗", word: "error", color: "color.text.error" },
  { glyph: "blank", word: "not covered", color: "color.text.muted" },
];
