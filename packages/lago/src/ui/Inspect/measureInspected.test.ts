import { describe, expect, it } from "vitest";
import { drawPicture, makeRecord } from "../../../testing/records.js";
import measureInspected from "./measureInspected.js";

const expected = drawPicture(["title", "first row", "second row"]);
const actual = {
  ...drawPicture(["title", "first line", "second row"]),
  lines: [
    drawPicture(["title"]).lines.flatMap((runs) =>
      runs.map((run) => ({ ...run, attributes: ["bold" as const] })),
    ),
    ...drawPicture(["first line", "second row"]).lines,
  ],
};
const changed = makeRecord("component/Row", "Long", {
  status: "changed",
  actual,
  expected,
});

describe("measureInspected", () => {
  it("counts the difference's lines as they are drawn: its words, a gap, two for a line of text and one for a line of style", () => {
    const view = measureInspected({
      record: changed,
      viewportName: "terminal",
      difference: true,
      width: 40,
      height: 4,
    });
    // Five lines in a frame of two leave three to scroll.
    expect(view).toMatchObject({ shown: "difference", scroll: 3, cols: 38 });
  });

  it("ends the cursor at the picture's last cell drawn, its columns cut at the region's", () => {
    const wide = makeRecord("component/Row", "Wide", {
      actual: drawPicture(["a", "b", "c"], 80),
    });
    expect(
      measureInspected({
        record: wide,
        viewportName: "terminal",
        difference: false,
        width: 40,
        height: 4,
      }),
    ).toMatchObject({
      shown: "picture",
      cols: 38,
      scroll: 1,
      cell: { x: 37, y: 2 },
    });
  });

  it("wraps a message to the region, and scrolls it", () => {
    expect(
      measureInspected({
        record: undefined,
        viewportName: "wide",
        difference: false,
        width: 14,
        height: 3,
      }),
    ).toMatchObject({
      shown: "message",
      message: ["This story", "is not drawn", "at wide."],
      scroll: 2,
    });
  });
});
