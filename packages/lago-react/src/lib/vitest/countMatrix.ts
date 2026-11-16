import type { Cell, MatrixTotals, ModeTotals, StoryResult } from "./types.js";

const none: ModeTotals = { equal: 0, distinct: 0, unreached: 0, excluded: 0 };

/**
 * What a run's stories came to across the matrix: how many base pictures were
 * drawn, and for each mode, in the order the run first met it, how many
 * pictures were equal to the base's, distinct, equal where the mode expected
 * a change, and left out.
 */
export default function countMatrix(
  stories: readonly StoryResult[],
  excluded: readonly Cell[],
): MatrixTotals {
  const modes: Record<string, ModeTotals> = {};
  const add = (mode: string, key: keyof ModeTotals) => {
    const totals = modes[mode] ?? none;
    modes[mode] = { ...totals, [key]: totals[key] + 1 };
  };
  let base = 0;
  for (const { mode, comparison } of stories) {
    if (mode === undefined || comparison === undefined) base += 1;
    else if (!comparison.equal) add(mode, "distinct");
    else add(mode, comparison.expectedToDiffer ? "unreached" : "equal");
  }
  for (const { mode } of excluded) add(mode, "excluded");
  return { base, modes };
}
