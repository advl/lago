import { RGBA, TextAttributes } from "@opentui/core";
import type { Tokens } from "./types.js";

/**
 * The token values: the terminal's own colours, named by their palette
 * index, and one glyph for each meaning. A colour is always paired with a
 * glyph or a word on screen, so nothing is lost on a terminal that shows it
 * differently. `color.text` and `color.background` are the terminal's
 * default foreground and background, so ordinary text follows its theme;
 * the rest name the palette's indices, 1 red, 2 green, 3 yellow, 7 white
 * and 8 bright black, which every terminal palette shows in its own hue.
 * Muted text and the border take white, apart from the bright-black
 * selection.
 */
export const tokens: Tokens = {
  "color.text": RGBA.defaultForeground(),
  "color.text.muted": RGBA.fromIndex(7),
  "color.text.error": RGBA.fromIndex(1),
  "color.text.warning": RGBA.fromIndex(3),
  "color.text.success": RGBA.fromIndex(2),
  "color.border": RGBA.fromIndex(7),
  "color.background": RGBA.defaultBackground(),
  "color.background.selected": RGBA.fromIndex(8),
  "typography.weight.bold": TextAttributes.BOLD,
  "typography.style.italic": TextAttributes.ITALIC,
  "glyph.rule": "─",
  "glyph.failed": "✗",
  "glyph.succeeded": "✓",
  "glyph.below": "↓",
  "glyph.cut": "…",
  "glyph.separator": "·",
};
