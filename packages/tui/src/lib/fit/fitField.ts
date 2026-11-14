import { fitRules } from "./constants.js";
import cutMiddle from "./cutMiddle.js";
import readRule from "./readRule.js";
import sanitize from "./sanitize.js";
import trimText from "./trimText.js";
import type { Field, FitRules, LineRule, Slot } from "./types.js";
import wrapText from "./wrapText.js";

/** Fits `text` to one line of `cells` display cells by `rule`. */
function fitLine(text: string, rule: LineRule, cells: number): string {
  if (typeof rule === "object") {
    return fitLine(text.replace(rule.drop, ""), rule.cut, cells);
  }
  switch (rule) {
    case "whole":
      return sanitize(text);
    case "cutMiddle":
      return cutMiddle(text, cells);
    case "cutEnd":
      return trimText(text, cells);
  }
}

/**
 * Fits `field` to `cells` display cells of `slot` by the rule its kind has
 * there in `rules`, the base table unless another is given: one line on a
 * line, the lines it takes in a block. Its text passes through `sanitize`
 * first, so no control sequence reaches the screen, and every width is
 * counted in display cells.
 */
export default function fitField(
  field: Field,
  slot: "line",
  cells: number,
  rules?: FitRules,
): string;
export default function fitField(
  field: Field,
  slot: "block",
  cells: number,
  rules?: FitRules,
): string[];
export default function fitField(
  field: Field,
  slot: Slot,
  cells: number,
  rules: FitRules = fitRules,
): string | string[] {
  const rule = readRule(rules, field.kind);
  if (slot === "line") return fitLine(field.text, rule.line, cells);
  return rule.block === "wrap"
    ? wrapText(field.text, cells)
    : [sanitize(field.text)];
}
