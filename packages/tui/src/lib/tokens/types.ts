import type { RGBA } from "@opentui/core";

/**
 * The terminal's semantic tokens. Each names a meaning on screen, never a
 * colour or a shape, so a theme can change every value without a component
 * noticing. An application with meanings of its own extends this interface
 * and spreads `tokens` into its own set.
 */
export interface Tokens {
  /** Ordinary text. */
  readonly "color.text": RGBA;
  /** Context rather than action: separators, key labels, what is not chosen. */
  readonly "color.text.muted": RGBA;
  /** An error, a refusal, or something failing. */
  readonly "color.text.error": RGBA;
  /** Something that wants attention soon, or has changed. */
  readonly "color.text.warning": RGBA;
  /** The result of an action that succeeded, or something passing. */
  readonly "color.text.success": RGBA;
  /** A neutral marker or a frame. */
  readonly "color.border": RGBA;
  /** The screen. */
  readonly "color.background": RGBA;
  /** The selected item: the only background drawn on the screen. */
  readonly "color.background.selected": RGBA;
  /** Emphasis, as the renderer's text attribute. */
  readonly "typography.weight.bold": number;
  /**
   * A title or a quotation, as the renderer's text attribute. Where the
   * terminal draws no italic, the text's place still says what it is.
   */
  readonly "typography.style.italic": number;
  /** A section heading's rule, to the edge of its region. */
  readonly "glyph.rule": string;
  /** Failed. */
  readonly "glyph.failed": string;
  /** Succeeded. */
  readonly "glyph.succeeded": string;
  /** More below the region. */
  readonly "glyph.below": string;
  /** Text cut here. */
  readonly "glyph.cut": string;
  /** Separates fields on a line. */
  readonly "glyph.separator": string;
}
