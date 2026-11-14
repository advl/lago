import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("loads", async () => {
    expect(await import("./index.js")).toBeDefined();
  });
});
