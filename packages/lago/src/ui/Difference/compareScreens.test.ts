import { describe, expect, it } from "vitest";
import { drawPicture } from "../../../testing/records.js";
import compareScreens from "./compareScreens.js";

describe("compareScreens", () => {
  it("gives the lines whose text differs, a line one picture lacks among them", () => {
    expect(
      compareScreens(
        drawPicture(["same", "was"]),
        drawPicture(["same", "now", "added"]),
      ),
    ).toEqual([
      { line: 1, expected: "was", actual: "now", kind: "text" },
      { line: 2, expected: "", actual: "added", kind: "text" },
    ]);
  });

  it("gives a line whose text is the same but whose colours or attributes differ", () => {
    const plain = drawPicture(["word"]);
    const bold = {
      ...plain,
      lines: plain.lines.map((runs) =>
        runs.map((run) => ({ ...run, attributes: ["bold" as const] })),
      ),
    };
    expect(compareScreens(plain, bold)).toEqual([
      { line: 0, expected: "word", actual: "word", kind: "style" },
    ]);
    expect(compareScreens(plain, plain)).toEqual([]);
    expect(
      compareScreens(drawPicture(["kept", "gone"]), drawPicture(["kept"])),
    ).toEqual([{ line: 1, expected: "gone", actual: "", kind: "text" }]);
  });
});
