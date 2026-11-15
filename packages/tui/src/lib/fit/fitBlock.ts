import { fitRules } from "./constants.js";
import fitRuns from "./fitRuns.js";
import readRule from "./readRule.js";
import type { FitRules, Run } from "./types.js";
import wrapRuns from "./wrapRuns.js";

/**
 * Fits the runs of one line of text of `kind` to a block `cells` wide by
 * the rule `rules` gives that kind there: wrapped over as many lines as it
 * needs, or kept on one, cut at its end.
 */
export default function fitBlock<Look extends Run>(
  runs: readonly Look[],
  kind: string,
  cells: number,
  rules: FitRules = fitRules,
): Look[][] {
  return readRule(rules, kind).block === "wrap"
    ? wrapRuns(runs, cells)
    : [fitRuns(runs, cells)];
}
