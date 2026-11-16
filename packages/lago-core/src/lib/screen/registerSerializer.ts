import { expect } from "vitest";
import { formatGolden } from "../golden/index.js";
import type { Screenshot } from "../screenshot/index.js";

let registered = false;

const isScreenshot = (value: unknown): value is Screenshot =>
  typeof value === "object" &&
  value !== null &&
  "cols" in value &&
  "rows" in value &&
  "lines" in value &&
  Array.isArray(value.lines);

/**
 * Teaches vitest's snapshots to write a screenshot as a golden's text, so one
 * given to any snapshot matcher is saved as the picture and its runs, and a
 * difference reads as changed lines of both.
 *
 * @note Impure: registers on vitest's `expect`, once for each test file.
 */
export default function registerSerializer(): void {
  if (registered) return;
  registered = true;
  expect.addSnapshotSerializer({
    test: isScreenshot,
    serialize: (value: Screenshot) => formatGolden(value).trimEnd(),
  });
}
