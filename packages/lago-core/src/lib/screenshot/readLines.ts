import type { Screenshot } from "./types.js";

/** The text of each line, without the spaces that end it. */
export default function readLines({ lines }: Screenshot): string[] {
  return lines.map((runs) => {
    let line = "";
    let column = 0;
    for (const run of runs) {
      line += " ".repeat(run.x - column) + run.text;
      column = run.x + run.width;
    }
    return line.replace(/ +$/, "");
  });
}
