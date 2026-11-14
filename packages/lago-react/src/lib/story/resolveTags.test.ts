import { describe, expect, it } from "vitest";
import resolveTags from "./resolveTags.js";

describe("resolveTags", () => {
  it("starts every story as shown in the gallery and tested", () => {
    expect(resolveTags()).toEqual(["dev", "test"]);
  });

  it("adds each layer's tags in turn, the file's before the story's", () => {
    expect(resolveTags(["slow"], undefined, ["wide"])).toEqual([
      "dev",
      "test",
      "slow",
      "wide",
    ]);
  });

  it("takes away a tag written with ! before it, whichever layer gave it", () => {
    expect(resolveTags(["!test"])).toEqual(["dev"]);
    expect(resolveTags(["slow"], ["!slow", "!dev"])).toEqual(["test"]);
    expect(resolveTags(["!test"], ["test"])).toEqual(["dev", "test"]);
  });
});
