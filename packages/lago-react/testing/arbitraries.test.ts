import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { measureLine, reportedLine } from "./arbitraries.js";

describe("reportedLine", () => {
  it("generates lines with wide characters, gaps, and runs in order", () => {
    const lines = fc.sample(reportedLine, { numRuns: 500, seed: 7 });
    const runs = lines.flat();
    expect(runs.some(({ text }) => text.includes("日"))).toBe(true);
    expect(runs.some(({ text, width }) => width > [...text].length)).toBe(true);
    for (const line of lines) {
      let end = 0;
      for (const run of line) {
        expect(run.x).toBeGreaterThanOrEqual(end);
        end = run.x + run.width;
      }
    }
  });
});

describe("measureLine", () => {
  it("gives the column a line's last run ends at", () => {
    const run = { fg: "default", bg: "default", attributes: [] } as const;
    expect(
      measureLine([
        { ...run, x: 0, text: "a", width: 1 },
        { ...run, x: 3, text: "日", width: 2 },
      ]),
    ).toBe(5);
    expect(measureLine([])).toBe(0);
  });
});
