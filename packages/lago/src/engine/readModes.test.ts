import { describe, expect, it } from "vitest";
import readModes from "./readModes.js";

describe("readModes", () => {
  it("reads the modes the stories plugin names, in their order, with their globals", () => {
    expect(
      readModes({
        modes: {
          dark: { globals: { scheme: "dark" }, expect: { tags: ["coloured"] } },
          ascii: { globals: { glyphs: "ascii" } },
        },
      }),
    ).toEqual([
      { name: "dark", globals: { scheme: "dark" } },
      { name: "ascii", globals: { glyphs: "ascii" } },
    ]);
  });

  it("reads none from a plugin that names none, or from no plugin", () => {
    expect(readModes({})).toEqual([]);
    expect(readModes(undefined)).toEqual([]);
  });
});
