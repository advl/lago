import { describe, expect, it } from "vitest";
import { drawPicture } from "../../../testing/records.js";
import describeDifference from "./describeDifference.js";

const picture = drawPicture(["a"], 40);

describe("describeDifference", () => {
  it("says how many lines differ, and in what", () => {
    const text = { line: 0, expected: "a", actual: "b", kind: "text" as const };
    const style = { ...text, actual: "a", kind: "style" as const };
    expect(describeDifference([text], picture, picture)).toBe(
      "1 line differs: 1 in text.",
    );
    expect(describeDifference([text, text, style], picture, picture)).toBe(
      "3 lines differ: 2 in text, 1 in colour or attributes only.",
    );
    expect(describeDifference([style], picture, picture)).toBe(
      "1 line differs: 1 in colour or attributes only.",
    );
  });

  it("says first that the picture changed size, and when no line differs", () => {
    expect(describeDifference([], drawPicture(["a"], 20), picture)).toBe(
      "drawn at 40×1, the golden at 20×1; no line differs.",
    );
  });
});
