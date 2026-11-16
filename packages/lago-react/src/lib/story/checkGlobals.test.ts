import { describe, expect, it } from "vitest";
import checkGlobals from "./checkGlobals.js";

const globalTypes = {
  scheme: { values: ["light", "dark"], default: "light" },
  density: { values: ["compact", "roomy"], default: "roomy" },
};

describe("checkGlobals", () => {
  it("takes globals the preview declares, at their values", () => {
    expect(() =>
      checkGlobals(globalTypes, { scheme: "dark" }, "the story"),
    ).not.toThrow();
    expect(() => checkGlobals({}, {}, "the story")).not.toThrow();
  });

  it("refuses a global the preview does not declare, naming those it does", () => {
    expect(() =>
      checkGlobals(
        globalTypes,
        { theme: "dark" },
        'Row.stories.tsx: the story "rows/Row Default"',
      ),
    ).toThrow(
      'Row.stories.tsx: the story "rows/Row Default" sets the global "theme", which the preview does not declare: it declares scheme, density.',
    );
  });

  it("says how to declare one when the preview declares none", () => {
    expect(() => checkGlobals({}, { scheme: "dark" }, "The mode dark")).toThrow(
      `The mode dark sets the global "scheme", which the preview does not declare: it declares none: declare each in the preview's globalTypes.`,
    );
  });

  it("refuses a value a global does not take, naming its values", () => {
    expect(() =>
      checkGlobals(globalTypes, { scheme: "neon" }, "The mode neon"),
    ).toThrow(
      'The mode neon sets the global scheme to "neon", which is not one of its values: light, dark.',
    );
  });

  it("reads no global from the object's prototype", () => {
    expect(() =>
      checkGlobals(globalTypes, { toString: "x" }, "the story"),
    ).toThrow('sets the global "toString", which the preview does not declare');
  });
});
