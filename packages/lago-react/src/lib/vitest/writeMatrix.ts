import type { MatrixTotals, ModeTotals } from "./types.js";

const sum = (modes: readonly ModeTotals[], key: keyof ModeTotals) =>
  modes.reduce((total, mode) => total + mode[key], 0);

/** One mode's figures, or all of them added up, in the words a reader scans. */
const writeFigures = ({ equal, distinct, unreached, excluded }: ModeTotals) =>
  `${distinct} distinct · ${equal} equal · ${unreached} expected but equal · ${excluded} excluded`;

/**
 * The matrix totals as lines of text to print after a run: a line for the
 * whole, then one per mode. Nothing for a run that drew no mode.
 */
export default function writeMatrix({ base, modes }: MatrixTotals): string[] {
  const named = Object.entries(modes);
  if (named.length === 0) return [];
  const all = named.map(([, totals]) => totals);
  const covered =
    base + sum(all, "equal") + sum(all, "distinct") + sum(all, "unreached");
  const width = Math.max(...named.map(([name]) => name.length));
  const total: ModeTotals = {
    equal: sum(all, "equal"),
    distinct: sum(all, "distinct"),
    unreached: sum(all, "unreached"),
    excluded: sum(all, "excluded"),
  };
  return [
    `Matrix: ${covered} pictures covered, ${base} in the base and ${covered - base} in ${named.length} ${named.length === 1 ? "mode" : "modes"}: ${writeFigures(total)}`,
    ...named.map(
      ([name, totals]) => `  ${name.padEnd(width)}  ${writeFigures(totals)}`,
    ),
  ];
}
