import { describe, expect, it } from "vitest";
import { keysPicture } from "../../../testing/pictures.js";
import placeRuns from "./placeRuns.js";

const texts = (pieces: { text: string }[]) => pieces.map(({ text }) => text);

describe("placeRuns", () => {
  it("draws each run at its column, the columns between them blank", () => {
    expect(texts(placeRuns(keysPicture.lines.at(0) ?? [], 40))).toEqual([
      "↑↓",
      " ",
      "move",
      " ",
      "?",
    ]);
  });

  it("drops a character that would cross the last column, wide characters by their two columns", () => {
    const line = keysPicture.lines.at(2) ?? [];
    expect(texts(placeRuns(line, 5))).toEqual(["  ", "日", " "]);
    expect(texts(placeRuns(line, 6))).toEqual(["  ", "日本"]);
    expect(texts(placeRuns(keysPicture.lines.at(0) ?? [], 4))).toEqual([
      "↑↓",
      " ",
      "m",
    ]);
  });

  it("gives the cursor's cell a piece of its own, a wide character whole", () => {
    expect(
      placeRuns(keysPicture.lines.at(2) ?? [], 40, 5).map(
        ({ text, cursor }) => [text, cursor],
      ),
    ).toEqual([
      ["  ", false],
      ["日", false],
      ["本", true],
      [" ", false],
      ["wide", false],
    ]);
  });

  it("stands the cursor on a blank cell past the last run, never past the last column", () => {
    expect(texts(placeRuns([], 10, 3))).toEqual(["   ", " "]);
    expect(placeRuns([], 10, 3).at(-1)?.cursor).toBe(true);
    expect(texts(placeRuns([], 4, 9))).toEqual(["    "]);
  });
});
