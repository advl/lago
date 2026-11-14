import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import { drawPicture } from "../../../testing/records.js";
import Difference from "./Difference.js";

const expected = drawPicture(["title", "first row", "second row"]);
const actual = drawPicture(["title", "first line", "second row", "third row"]);

describe("Difference", () => {
  it("states the difference in words, then each differing line, the golden's over the picture's", async () => {
    const screen = await render(
      <Difference
        expected={expected}
        actual={actual}
        from={0}
        lines={8}
        cols={70}
      />,
      { cols: 70, rows: 8 },
    );
    expect(screen.lines.slice(0, 7)).toEqual([
      "drawn at 40×4, the golden at 40×3; 2 lines differ: 2 in text.",
      "",
      "  2 − first row",
      "    + first line",
      "  4 −",
      "    + third row",
      "",
    ]);
  });

  it("marks a line that differs only in colour once, and scrolls", async () => {
    const bold = {
      ...expected,
      lines: expected.lines.map((runs, line) =>
        line === 0
          ? runs.map((run) => ({ ...run, attributes: ["bold" as const] }))
          : runs,
      ),
    };
    const screen = await render(
      <Difference
        expected={expected}
        actual={bold}
        from={2}
        lines={2}
        cols={40}
      />,
      { cols: 40, rows: 3 },
    );
    expect(screen.lines).toEqual(["  1 ~ title", "", ""]);
  });
});
