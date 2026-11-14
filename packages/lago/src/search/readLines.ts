import type { Screenshot } from "@aztlan/lago-react";

/**
 * The text each line of a picture draws, every run at its column: the
 * columns between runs are counted in cells, so a run after a wide
 * character keeps its place.
 */
export default function readLines({ lines }: Screenshot): string[] {
  return lines.map((runs) => {
    let line = "";
    let column = 0;
    for (const run of runs) {
      line += " ".repeat(Math.max(0, run.x - column)) + run.text;
      column = run.x + run.width;
    }
    return line;
  });
}
