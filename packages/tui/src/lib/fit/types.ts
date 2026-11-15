/**
 * Where a field is drawn: `line`, one line such as a row's, a heading or a
 * status line; or `block`, a place with room to wrap, such as a notice or
 * the help.
 */
export type Slot = "line" | "block";

/**
 * How a field is fitted to one line: kept `whole`, or, when too narrow for
 * it, cut with `…` at its end (`cutEnd`) or in its middle (`cutMiddle`). A
 * rule may first `drop` the part of the text a line can do without, such as
 * a prefix every value shares, and then `cut` what is left by one of the
 * two cutting rules.
 */
export type LineRule =
  | "whole"
  | "cutEnd"
  | "cutMiddle"
  | { readonly drop: RegExp; readonly cut: "cutEnd" | "cutMiddle" };

/** How a field is fitted to a block: kept `whole` on one line, or wrapped (`wrap`). */
export type BlockRule = "whole" | "wrap";

/** How one kind of field is fitted to each slot. */
export interface FitRule {
  readonly line: LineRule;
  readonly block: BlockRule;
}

/** The rule for each kind of text, by the kind's name. */
export type FitRules = Readonly<Record<string, FitRule>>;

/** One piece of text to draw, whole, with the kind of text it is. */
export interface Field {
  readonly text: string;
  /** A kind the rule table has, such as `title` or `identifier`. */
  readonly kind: string;
}

/**
 * A run of a line's text as the fitting functions take it: its text, and
 * whether it opens with a mark, such as a person's, which never gives way.
 */
export interface Run {
  readonly text: string;
  readonly marked?: boolean;
}
