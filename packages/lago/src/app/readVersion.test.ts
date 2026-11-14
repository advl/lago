import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished } from "vitest";
import readVersion from "./readVersion.js";

describe("readVersion", () => {
  it("reads the version of the nearest package above a folder", () => {
    expect(readVersion(import.meta.dirname)).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("refuses a folder with no package above it", () => {
    const folder = mkdtempSync(join(tmpdir(), "lago-no-package-"));
    onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
    expect(() => readVersion(folder)).toThrow("No package.json above /");
  });
});
