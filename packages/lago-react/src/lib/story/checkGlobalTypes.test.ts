import { describe, expect, it } from "vitest";
import checkGlobalTypes from "./checkGlobalTypes.js";
import type { GlobalTypes } from "./types.js";

describe("checkGlobalTypes", () => {
  it("takes globals each with values and a default among them, and none at all", () => {
    expect(() =>
      checkGlobalTypes(
        { scheme: { values: ["light", "dark"], default: "dark" } },
        "The preview",
      ),
    ).not.toThrow();
    expect(() => checkGlobalTypes(undefined, "The preview")).not.toThrow();
  });

  it.each([
    ["no values", { default: "light" }],
    ["an empty list", { values: [], default: "light" }],
    ["values that are not text", { values: [1, 2], default: 1 }],
    ["no declaration at all", undefined],
  ])("refuses a global with %s, saying what to give", (_, declared) => {
    expect(() =>
      checkGlobalTypes(
        { scheme: declared } as unknown as GlobalTypes,
        "The preview /p/lago.preview.tsx",
      ),
    ).toThrow(
      'The preview /p/lago.preview.tsx declares the global scheme with no values to take. Give it a list of text, as in scheme: { values: ["light", "dark"], default: "light" }.',
    );
  });

  it("refuses a default that is not one of the values, naming them", () => {
    expect(() =>
      checkGlobalTypes(
        { scheme: { values: ["light", "dark"], default: "dim" } },
        "The preview",
      ),
    ).toThrow(
      'The preview gives the global scheme the default "dim", which is not one of its values: light, dark.',
    );
  });
});
