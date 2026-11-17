import { describe, expect, it } from "vitest";
import placeWindow from "./placeWindow.js";

describe("placeWindow", () => {
  it("keeps the view where it is while the selected one is in it", () => {
    expect(placeWindow(4, 6, 5, 20)).toBe(4);
  });

  it("moves the view as little as brings the selected one into it, either way", () => {
    expect(placeWindow(4, 12, 5, 20)).toBe(8);
    expect(placeWindow(4, 2, 5, 20)).toBe(2);
  });

  it("never starts past the last view that fills, nor before the first", () => {
    expect(placeWindow(18, 19, 5, 20)).toBe(15);
    expect(placeWindow(0, 0, 5, 3)).toBe(0);
    expect(placeWindow(3, -1, 5, 3)).toBe(0);
  });
});
