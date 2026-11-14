import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished } from "vitest";
import readGolden from "./readGolden.js";

function writeGolden(text: string): string {
  const folder = mkdtempSync(join(tmpdir(), "lago-goldens-"));
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
  const path = join(folder, "Row.Default.narrow.golden");
  writeFileSync(path, text);
  return path;
}

describe("readGolden", () => {
  it("gives the screenshot a golden file holds", () => {
    const path = writeGolden('8x1\n|hi\n\n1:1 "hi" fg=2\n');
    expect(readGolden(path)).toEqual({
      cols: 8,
      rows: 1,
      lines: [
        [{ x: 0, text: "hi", width: 2, fg: 2, bg: "default", attributes: [] }],
      ],
    });
  });

  it("gives nothing where there is no file, or one that is no golden", () => {
    expect(readGolden(join(tmpdir(), "lago-no-such.golden"))).toBeUndefined();
    expect(readGolden(writeGolden("edited by hand\n"))).toBeUndefined();
  });
});
