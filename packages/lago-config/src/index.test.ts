import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("exports the one function a configuration file imports", async () => {
    expect(Object.keys(await import("./index.js"))).toEqual(["createConfig"]);
  });
});
