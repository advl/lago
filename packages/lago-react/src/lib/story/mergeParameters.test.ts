import { describe, expect, it } from "vitest";
import mergeParameters from "./mergeParameters.js";

describe("mergeParameters", () => {
  it("merges an object into the object before it, key by key, at any depth", () => {
    expect(
      mergeParameters(
        { docs: { description: { component: "A box." } }, rows: 4 },
        undefined,
        { docs: { description: { story: "Empty." } }, rows: 8 },
      ),
    ).toEqual({
      docs: { description: { component: "A box.", story: "Empty." } },
      rows: 8,
    });
  });

  it("replaces anything that is not a plain object, a list included", () => {
    const when = new Date(0);
    expect(
      mergeParameters(
        { sizes: [1, 2], when: {}, flag: { on: true } },
        {
          sizes: [3],
          when,
          flag: null,
        },
      ),
    ).toEqual({ sizes: [3], when, flag: null });
  });

  it("gives an empty object for no layers", () => {
    expect(mergeParameters()).toEqual({});
  });
});
