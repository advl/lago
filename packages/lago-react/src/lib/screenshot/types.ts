/**
 * A colour as it was asked for: the terminal's own, a palette entry from 0 to
 * 255, or a fixed colour as `#rrggbb`. A palette entry stays an entry, so a
 * screenshot is true in every terminal theme.
 */
export type Color = "default" | number | `#${string}`;

export type Attribute =
  | "blink"
  | "bold"
  | "dim"
  | "hidden"
  | "inverse"
  | "italic"
  | "strikethrough"
  | "underline";

/** Text drawn in one style on one line. */
export interface Run {
  /** The first column, counted from 0. */
  readonly x: number;
  readonly text: string;
  /** The columns occupied, as the renderer measured them: a wide character takes two. */
  readonly width: number;
  readonly fg: Color;
  readonly bg: Color;
  /** In alphabetical order. */
  readonly attributes: readonly Attribute[];
}

/** What a screen shows: every run of text with its style. */
export interface Screenshot {
  readonly cols: number;
  readonly rows: number;
  /**
   * One entry per line, its runs from left to right. A column that no run
   * covers shows nothing.
   */
  readonly lines: readonly (readonly Run[])[];
}
