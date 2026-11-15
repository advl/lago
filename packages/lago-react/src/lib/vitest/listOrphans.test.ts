import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished } from "vitest";
import listOrphans from "./listOrphans.js";

function makeFolder(...entries: string[]): string {
  const folder = mkdtempSync(join(tmpdir(), "lago-goldens-"));
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
  for (const entry of entries) writeFileSync(join(folder, entry), "");
  return folder;
}

describe("listOrphans", () => {
  it("gives the file's goldens that none of its stories owns", () => {
    const folder = makeFolder(
      "Row.Default.narrow.golden",
      "Row.Default.wide.golden",
      "Row.Renamed.narrow.golden",
      "Row.Gone.wide.golden",
    );
    const owned = new Set([
      join(folder, "Row.Default.narrow.golden"),
      join(folder, "Row.Default.wide.golden"),
    ]);
    expect(listOrphans(folder, "Row", owned)).toEqual([
      join(folder, "Row.Gone.wide.golden"),
      join(folder, "Row.Renamed.narrow.golden"),
    ]);
  });

  it("leaves alone what belongs to another stories file, or is no golden", () => {
    const folder = makeFolder(
      "Row.Selected.Default.narrow.golden",
      "RowGroup.Default.narrow.golden",
      "Row.Default.narrow.txt",
      "Row.narrow.golden",
      "Row..narrow.golden",
      "notes.md",
    );
    expect(listOrphans(folder, "Row", new Set())).toEqual([]);
  });

  it("gives nothing where there is no folder of goldens", () => {
    expect(
      listOrphans(join(tmpdir(), "lago-no-such-folder"), "Row", new Set()),
    ).toEqual([]);
  });
});
