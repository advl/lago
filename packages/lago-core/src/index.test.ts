import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("exports what a renderer's package reads a screen and a golden with, and no other", async () => {
    expect(Object.keys(await import("./index.js")).sort()).toEqual([
      "attributeNames",
      "formatGolden",
      "getByText",
      "normalizeRuns",
      "parseGolden",
      "readLines",
    ]);
  });
});
