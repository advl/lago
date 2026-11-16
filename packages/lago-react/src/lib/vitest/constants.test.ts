import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderer } from "./constants.js";

const manifest = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../package.json"), "utf8"),
) as { peerDependencies: Record<string, string> };

describe("renderer", () => {
  it("keeps to one copy every package a project brings for the renderer and React", () => {
    const brought = Object.keys(manifest.peerDependencies).filter(
      (name) => name !== "vitest",
    );
    expect(renderer.sharedPackages).toEqual(expect.arrayContaining(brought));
  });

  it("takes JSX from a package it keeps to one copy", () => {
    expect(renderer.sharedPackages).toContain(renderer.jsxImportSource);
  });
});
