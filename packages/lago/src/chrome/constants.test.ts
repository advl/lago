import type { ChromeName } from "@aztlan/lago-config";
import { tokens } from "@aztlan/tui";
import type { RGBA } from "@opentui/core";
import { describe, expect, expectTypeOf, it } from "vitest";
import { chromes } from "./constants.js";

/** A colour's relative luminance, as the contrast ratio reads it. */
const measureLuminance = ({ r, g, b }: RGBA) => {
  const [red = 0, green = 0, blue = 0] = [r, g, b].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

/** The contrast ratio of two colours, from 1 to 21. */
const measureContrast = (one: RGBA, other: RGBA) => {
  const [light, dark] = [measureLuminance(one), measureLuminance(other)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (light + 0.05) / (dark + 0.05);
};

const texts = [
  "color.text",
  "color.text.muted",
  "color.text.error",
  "color.text.warning",
  "color.text.success",
] as const;

describe("chromes", () => {
  it("has a chrome for each name createConfig takes, and no other", () => {
    expectTypeOf<keyof typeof chromes>().toEqualTypeOf<ChromeName>();
    expect(Object.keys(chromes)).toEqual(["terminal", "light", "dark"]);
  });

  it("is the terminal's own tokens under terminal", () => {
    expect(chromes.terminal).toBe(tokens);
  });

  it.each(["light", "dark"] as const)(
    "keeps %s's text legible on its background and its selected shade, and its border visible",
    (name) => {
      const chrome = chromes[name];
      for (const text of texts) {
        for (const under of [
          "color.background",
          "color.background.selected",
        ] as const) {
          expect(
            measureContrast(chrome[text], chrome[under]),
            `${text} on ${under}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(
        measureContrast(chrome["color.border"], chrome["color.background"]),
      ).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(["light", "dark"] as const)(
    "fixes every colour of %s, the background included, and keeps the terminal's glyphs",
    (name) => {
      const chrome = chromes[name];
      for (const [token, value] of Object.entries(chrome)) {
        if (token.startsWith("color.")) {
          expect((value as RGBA).intent, token).toBe("rgb");
        } else {
          expect(value, token).toBe(tokens[token as keyof typeof tokens]);
        }
      }
    },
  );
});
