import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("exports what a renderer's package builds a screen and keeps a golden with, a plugin's definition, and no other", async () => {
    expect(Object.keys(await import("./index.js")).sort()).toEqual([
      "attributeNames",
      "createScreen",
      "defaultViewport",
      "definePlugin",
      "formatGolden",
      "normalizeRuns",
      "parseGolden",
      "registerSerializer",
      "renderStream",
      "screenshotFromBytes",
      "stoppedTimers",
      "waitFor",
    ]);
  });
});
