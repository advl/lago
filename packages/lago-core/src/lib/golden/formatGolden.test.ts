import { describe, expect, it } from "vitest";
import type { Screenshot } from "../screenshot/index.js";
import formatGolden from "./formatGolden.js";

const plain = { fg: "default", bg: "default", attributes: [] } as const;

describe("formatGolden", () => {
  it("writes the size, the picture, then one line per run with what differs from plain text", () => {
    const screenshot: Screenshot = {
      cols: 40,
      rows: 4,
      lines: [
        [
          { ...plain, x: 0, text: "┃", width: 1, fg: 1, bg: 8 },
          {
            ...plain,
            x: 1,
            text: 'Fix the "parser" ',
            width: 17,
            bg: 8,
            attributes: ["bold"],
          },
          {
            ...plain,
            x: 18,
            text: "1d over",
            width: 7,
            fg: "#ff8800",
            bg: 8,
            attributes: ["bold", "underline"],
          },
        ],
        [],
        [{ ...plain, x: 2, text: "日本", width: 4 }],
        [],
      ],
    };
    expect(formatGolden(screenshot)).toBe(
      [
        "40x4",
        '|┃Fix the "parser" 1d over',
        "|",
        "|  日本",
        "",
        '1:1 "┃" fg=1 bg=8',
        '1:2 "Fix the \\"parser\\" " bg=8 bold',
        '1:19 "1d over" fg=#ff8800 bg=8 bold underline',
        '3:3 "日本" w=4',
        "",
      ].join("\n"),
    );
  });

  it("writes a screen that shows nothing as its size alone", () => {
    expect(formatGolden({ cols: 8, rows: 2, lines: [[], []] })).toBe("8x2\n\n");
  });
});
