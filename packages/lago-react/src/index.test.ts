import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("exports the values a test imports, and no other", async () => {
    expect(Object.keys(await import("./index.js")).sort()).toEqual([
      "composeStories",
      "render",
      "waitFor",
    ]);
  });
});
