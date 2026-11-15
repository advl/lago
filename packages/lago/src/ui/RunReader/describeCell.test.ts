import { describe, expect, it } from "vitest";
import { keysPicture } from "../../../testing/pictures.js";
import describeCell from "./describeCell.js";

describe("describeCell", () => {
  it("says the place, the run's text, both colours as asked and the attributes", () => {
    expect(describeCell(keysPicture, { x: 3, y: 2 })).toBe(
      "column 4, line 3: “日本” · fg palette 2 · bg the terminal's own",
    );
    expect(describeCell(keysPicture, { x: 7, y: 2 })).toBe(
      "column 8, line 3: “wide” · fg #ff8800 · bg the terminal's own",
    );
    expect(describeCell(keysPicture, { x: 8, y: 0 })).toBe(
      "column 9, line 1: “?” · fg the terminal's own · bg the terminal's own · bold",
    );
  });

  it("gives an inverted run's colours as asked, before the renderer exchanged them", () => {
    expect(describeCell(keysPicture, { x: 1, y: 3 })).toBe(
      "column 2, line 4: “ selected row ” · fg palette 2 · bg the terminal's own · inverse",
    );
  });

  it("says when nothing is drawn at the cell, past a line's runs or the picture's lines", () => {
    expect(describeCell(keysPicture, { x: 30, y: 0 })).toBe(
      "column 31, line 1: nothing drawn",
    );
    expect(describeCell(keysPicture, { x: 0, y: 9 })).toBe(
      "column 1, line 10: nothing drawn",
    );
  });
});
