import { describe, expect, it } from "vitest";
import readLines from "./readLines.js";

const run = { fg: "default", bg: "default", attributes: [] } as const;

describe("readLines", () => {
  it("gives each line's text with every run at its column", () => {
    expect(
      readLines({
        cols: 20,
        rows: 2,
        lines: [
          [
            { ...run, x: 2, text: "left", width: 4 },
            { ...run, x: 10, text: "right", width: 5 },
          ],
          [],
        ],
      }),
    ).toEqual(["  left    right", ""]);
  });
  it("places a run after a wide character at its own column", () => {
    expect(
      readLines({
        cols: 20,
        rows: 1,
        lines: [
          [
            { ...run, x: 0, text: "日本", width: 4 },
            { ...run, x: 5, text: "ok", width: 2 },
          ],
        ],
      }),
    ).toEqual(["日本 ok"]);
  });
});
