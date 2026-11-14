import type { Screenshot } from "@aztlan/lago-react";
import { readLines } from "../../search/index.js";
import type { DifferingLine } from "./types.js";

/**
 * The lines where `actual` differs from `expected`, in order: by their
 * text, or, where the text is the same, by any run's colours or attributes.
 */
export default function compareScreens(
  expected: Screenshot,
  actual: Screenshot,
): DifferingLine[] {
  const was = readLines(expected);
  const now = readLines(actual);
  const differing: DifferingLine[] = [];
  for (let line = 0; line < Math.max(was.length, now.length); line += 1) {
    const before = was.at(line) ?? "";
    const after = now.at(line) ?? "";
    if (before !== after) {
      differing.push({ line, expected: before, actual: after, kind: "text" });
    } else if (
      JSON.stringify(expected.lines.at(line)) !==
      JSON.stringify(actual.lines.at(line))
    ) {
      differing.push({ line, expected: before, actual: after, kind: "style" });
    }
  }
  return differing;
}
