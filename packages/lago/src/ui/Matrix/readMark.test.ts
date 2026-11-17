import { describe, expect, it } from "vitest";
import { makeRecord } from "../../../testing/records.js";
import readMark from "./readMark.js";

describe("readMark", () => {
  it("shows a picture by its look: its status, = when equal to the base, ! when a change was expected", () => {
    expect(readMark(makeRecord("component/Row", "Default"), false).glyph).toBe(
      "✓",
    );
    expect(
      readMark(
        makeRecord("component/Row", "Default", { comparison: "equal" }),
        false,
      ).glyph,
    ).toBe("=");
    expect(
      readMark(
        makeRecord("component/Row", "Default", {
          comparison: "unreached",
          status: "error",
        }),
        false,
      ).glyph,
    ).toBe("!");
    expect(
      readMark(
        makeRecord("component/Row", "Default", {
          comparison: "equal",
          status: "error",
        }),
        false,
      ).glyph,
    ).toBe("✗");
  });

  it("leaves a cell with no picture blank, saying whether its file leaves it out", () => {
    expect(readMark(undefined, true)).toMatchObject({
      glyph: " ",
      word: "left out",
    });
    expect(readMark(undefined, false)).toMatchObject({
      glyph: " ",
      word: "not drawn",
    });
  });
});
