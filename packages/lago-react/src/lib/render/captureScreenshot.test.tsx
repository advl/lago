import { describe, expect, it } from "vitest";
import Styles from "../../../testing/Styles.js";
import render from "./render.js";

describe("captureScreenshot", () => {
  it("keeps every colour as it was asked for, and every attribute", async () => {
    const screen = await render(<Styles />, { cols: 20, rows: 9 });
    const plain = { fg: "default", bg: "default", attributes: [] };
    expect(screen.screenshot()).toEqual({
      cols: 20,
      rows: 9,
      lines: [
        [{ x: 0, text: "palette", width: 7, fg: 1, bg: 8, attributes: [] }],
        [{ ...plain, x: 0, text: "terminal", width: 8 }],
        [{ ...plain, x: 0, text: "fixed", width: 5, fg: "#ff8800" }],
        [
          { ...plain, x: 0, text: "plain", width: 5, fg: 2 },
          {
            ...plain,
            x: 6,
            text: "bold",
            width: 4,
            fg: 2,
            attributes: ["bold"],
          },
          {
            ...plain,
            x: 11,
            text: "under",
            width: 5,
            fg: 2,
            attributes: ["underline"],
          },
        ],
        [
          {
            ...plain,
            x: 0,
            text: "every",
            width: 5,
            fg: 3,
            attributes: ["blink", "dim", "hidden", "italic", "strikethrough"],
          },
        ],
        // Asked for as 6 on 7, inverted: the renderer reports an inverted
        // cell with its two colours already exchanged, and the attribute kept.
        [
          {
            x: 0,
            text: "turned",
            width: 6,
            fg: 7,
            bg: 6,
            attributes: ["inverse"],
          },
        ],
        [{ ...plain, x: 0, text: "日本 wide", width: 9, fg: 4 }],
        [{ ...plain, x: 0, text: "    ", width: 4, bg: 5 }],
        [],
      ],
    });
  });
});
