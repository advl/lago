import { describe, expect, it } from "vitest";
import resolveGlobals from "./resolveGlobals.js";

const globalTypes = {
  scheme: { values: ["light", "dark", "dim"], default: "light" },
  density: { values: ["compact", "roomy"], default: "roomy" },
  glyphs: { values: ["unicode", "ascii"], default: "unicode" },
};

describe("resolveGlobals", () => {
  it("takes the story's value, then the mode's, then the default", () => {
    expect(
      resolveGlobals(
        { globalTypes, globals: { scheme: "dim" } },
        { scheme: "dark", density: "compact" },
      ),
    ).toEqual({ scheme: "dim", density: "compact", glyphs: "unicode" });
  });

  it("gives each global its default, or the story's, in no mode", () => {
    expect(
      resolveGlobals({ globalTypes, globals: { glyphs: "ascii" } }),
    ).toEqual({ scheme: "light", density: "roomy", glyphs: "ascii" });
    expect(resolveGlobals({ globalTypes: {}, globals: {} })).toEqual({});
  });
});
