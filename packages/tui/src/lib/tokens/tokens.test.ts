import { RGBA } from "@opentui/core";
import { describe, expect, it } from "vitest";
import { tokens } from "./constants.js";

describe("tokens", () => {
  it("names every colour as the terminal's own or a palette entry, so its theme decides the hue", () => {
    const colours = Object.entries(tokens).filter(
      (entry): entry is [string, RGBA] => entry[1] instanceof RGBA,
    );
    expect(colours.map(([name]) => name)).toEqual([
      "color.text",
      "color.text.muted",
      "color.text.error",
      "color.text.warning",
      "color.text.success",
      "color.border",
      "color.background",
      "color.background.selected",
    ]);
    for (const [, colour] of colours) {
      expect(["default", "indexed"]).toContain(colour.intent);
    }
  });

  it("gives each glyph one character", () => {
    const glyphs = Object.entries(tokens).filter(([name]) =>
      name.startsWith("glyph."),
    );
    for (const [, glyph] of glyphs) expect([...String(glyph)]).toHaveLength(1);
  });
});
