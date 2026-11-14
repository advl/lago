import { describe, expect, it } from "vitest";
import { drawPicture } from "../../testing/records.js";
import measurePicture from "./measurePicture.js";

describe("measurePicture", () => {
  it("measures from the top left to the widest run's end and the last line that shows anything", () => {
    expect(
      measurePicture(drawPicture(["ab", "", "abcde", "", ""], 40)),
    ).toEqual({
      cols: 5,
      rows: 3,
    });
  });

  it("counts a run's columns as the renderer measured them, wide characters included", () => {
    const picture = {
      cols: 10,
      rows: 1,
      lines: [
        [
          {
            x: 2,
            text: "日本",
            width: 4,
            fg: 1,
            bg: "default" as const,
            attributes: [],
          },
        ],
      ],
    };
    expect(measurePicture(picture)).toEqual({ cols: 6, rows: 1 });
  });

  it("gives a picture that shows nothing one cell, so its frame is still drawn", () => {
    expect(measurePicture(drawPicture(["", ""]))).toEqual({ cols: 1, rows: 1 });
  });
});
