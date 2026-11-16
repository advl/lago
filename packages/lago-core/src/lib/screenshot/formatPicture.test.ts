import { describe, expect, it } from "vitest";
import formatPicture from "./formatPicture.js";
import type { Run } from "./types.js";

const plain = { fg: "default", bg: "default", attributes: [] } as const;
const writeLine = (value: string): Run[] => [
  { ...plain, x: 0, text: value, width: value.length },
];

describe("formatPicture", () => {
  it("marks where each line starts and stops at the last line that shows anything", () => {
    const lines = [writeLine("one"), [], writeLine(" three"), [], []];
    expect(formatPicture({ cols: 10, rows: 5, lines })).toEqual([
      "|one",
      "|",
      "| three",
    ]);
  });

  it("is empty for a screen that shows nothing", () => {
    expect(formatPicture({ cols: 10, rows: 2, lines: [[], []] })).toEqual([]);
  });
});
