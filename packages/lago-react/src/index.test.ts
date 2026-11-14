import { describe, expect, it } from "vitest";

describe("the package's entries", () => {
  it("export from . the values a test imports, and no other", async () => {
    expect(Object.keys(await import("./index.js")).sort()).toEqual([
      "composeStories",
      "render",
      "waitFor",
    ]);
  });

  it("export from ./vitest the plugin, and nothing else", async () => {
    expect(Object.keys(await import("./vitest.js"))).toEqual(["testStories"]);
  });
});
