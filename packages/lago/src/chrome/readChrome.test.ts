import { tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";
import { describe, expect, it } from "vitest";
import { chromes } from "./constants.js";
import readChrome from "./readChrome.js";

const file = "/project/vitest.config.ts";

describe("readChrome", () => {
  it("draws in the terminal's own colours when the project asks for no chrome", () => {
    expect(readChrome(undefined, file)).toBe(tokens);
  });

  it("gives a built-in chrome by its name", () => {
    expect(readChrome("terminal", file)).toBe(tokens);
    expect(readChrome("light", file)).toBe(chromes.light);
    expect(readChrome("dark", file)).toBe(chromes.dark);
  });

  it("takes a project's own set of tokens, each colour made by the gallery's renderer", () => {
    const foreign = { buffer: RGBA.fromHex("#102030").buffer, intent: "rgb" };
    const own = { ...tokens, "color.text": foreign, "app.extra": 1 };
    const read = readChrome(own, file);
    expect(read["color.text"]).toBeInstanceOf(RGBA);
    expect(read["color.text"].toString()).toBe(
      RGBA.fromHex("#102030").toString(),
    );
    expect(read["color.text.muted"].intent).toBe("indexed");
    expect(read["glyph.rule"]).toBe("─");
    expect(read).toHaveProperty(["app.extra"], 1);
  });

  it("refuses a name no chrome has, naming the file and the chromes", () => {
    expect(() => readChrome("solarized", file)).toThrow(
      '/project/vitest.config.ts sets gallery.chrome to "solarized", which is no chrome: name one of terminal, light, dark, or give a set of tokens.',
    );
    expect(() => readChrome("toString", file)).toThrow("which is no chrome");
    expect(() => readChrome(null, file)).toThrow(
      "sets gallery.chrome to null, which is no chrome",
    );
  });

  it("refuses a set of tokens that lacks one, or gives one of another kind, naming each", () => {
    const { "color.border": _, ...lacking } = tokens;
    expect(() =>
      readChrome(
        {
          ...lacking,
          "glyph.rule": 1,
          "color.text": "#000",
          "color.text.muted": { buffer: new Uint16Array(3) },
        },
        file,
      ),
    ).toThrow(
      "/project/vitest.config.ts sets gallery.chrome to a set of tokens in which these are missing or of another kind than in @aztlan/tui's tokens: color.text, color.text.muted, color.border, glyph.rule. Give every token, each of its kind, or name one of terminal, light, dark.",
    );
  });

  it("gives a chrome a plugin offers, by its name, and refuses one that lacks a token, naming the plugin", () => {
    const contributed = {
      sepia: {
        plugin: "sepia",
        tokens: { ...tokens, "color.text": RGBA.fromHex("#704214") },
      },
      broken: {
        plugin: "sepia",
        tokens: { "color.text": RGBA.fromHex("#704214") },
      },
    };
    expect(
      readChrome("sepia", file, contributed)["color.text"].toString(),
    ).toBe(RGBA.fromHex("#704214").toString());
    expect(() => readChrome("broken", file, contributed)).toThrow(
      "The plugin sepia gives the chrome broken as a set of tokens in which these are missing or of another kind than in @aztlan/tui's tokens: color.text.muted",
    );
    expect(() => readChrome("mauve", file, contributed)).toThrow(
      "name one of terminal, light, dark, sepia, broken, or give a set of tokens.",
    );
  });
});
