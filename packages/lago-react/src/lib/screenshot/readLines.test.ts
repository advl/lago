import { describe, expect, it } from "vitest";
import readLines from "./readLines.js";
import type { Run } from "./types.js";

const plain = { fg: "default", bg: "default", attributes: [] } as const;

describe("readLines", () => {
  it("gives each line's text with every run at its column", () => {
    const lines: Run[][] = [
      [
        { ...plain, x: 2, text: "left", width: 4 },
        { ...plain, x: 10, text: "right", width: 5 },
      ],
      [],
      [
        { ...plain, x: 0, text: "日本", width: 4 },
        { ...plain, x: 5, text: "x", width: 1 },
      ],
    ];
    expect(readLines({ cols: 20, rows: 3, lines })).toEqual([
      "  left    right",
      "",
      "日本 x",
    ]);
  });

  it("leaves out the spaces that end a line, as an editor would", () => {
    const lines: Run[][] = [
      [{ ...plain, x: 0, text: "row   ", width: 6, bg: 8 }],
    ];
    expect(readLines({ cols: 6, rows: 1, lines })).toEqual(["row"]);
  });
});
