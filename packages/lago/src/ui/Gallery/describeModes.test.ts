import { describe, expect, it } from "vitest";
import describeModes from "./describeModes.js";

describe("describeModes", () => {
  it("names the base, each mode with the globals it sets, and the globals drawn with their values", () => {
    expect(
      describeModes(
        [{ name: "dark", globals: { scheme: "dark", tint: "16" } }],
        [
          { name: "scheme", values: ["light", "dark"] },
          { name: "tint", values: ["16"] },
        ],
      ),
    ).toEqual([
      "base: sets no global",
      "dark: sets scheme dark, tint 16",
      "globals drawn: scheme light, dark; tint 16",
    ]);
  });

  it("leaves the globals out when no story was drawn with one", () => {
    expect(describeModes([{ name: "dark", globals: {} }], [])).toEqual([
      "base: sets no global",
      "dark: sets no global",
    ]);
  });
});
