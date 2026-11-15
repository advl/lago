import type { Screenshot } from "@aztlan/lago-react";
import type { DifferingLine } from "./types.js";

/** `count` of `noun`, its plural taking an s. */
const countOf = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

/**
 * The difference between a picture and its golden, in words: how many
 * lines differ and in what, and a change of size first, when there is one.
 */
export default function describeDifference(
  differing: readonly DifferingLine[],
  expected: Screenshot,
  actual: Screenshot,
) {
  const words: string[] = [];
  if (expected.cols !== actual.cols || expected.rows !== actual.rows) {
    words.push(
      `drawn at ${actual.cols}×${actual.rows}, the golden at ${expected.cols}×${expected.rows}`,
    );
  }
  const text = differing.filter(({ kind }) => kind === "text").length;
  const style = differing.length - text;
  const kinds = [
    ...(text > 0 ? [`${text} in text`] : []),
    ...(style > 0 ? [`${style} in colour or attributes only`] : []),
  ];
  words.push(
    differing.length === 0
      ? "no line differs"
      : `${countOf(differing.length, "line")} ${differing.length === 1 ? "differs" : "differ"}: ${kinds.join(", ")}`,
  );
  return `${words.join("; ")}.`;
}
