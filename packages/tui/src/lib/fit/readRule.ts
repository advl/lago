import type { FitRule, FitRules } from "./types.js";

/** The rule `rules` gives text of `kind`; throws, naming the kind, when it gives none. */
export default function readRule(rules: FitRules, kind: string): FitRule {
  const rule = Object.hasOwn(rules, kind) ? rules[kind] : undefined;
  if (rule === undefined) {
    throw new Error(
      `No rule fits text of the kind ${JSON.stringify(kind)}. The kinds the table has are ${Object.keys(rules).join(", ")}; pass a table with this one.`,
    );
  }
  return rule;
}
