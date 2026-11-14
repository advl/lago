import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import checkOrphans from "./checkOrphans.js";

function makeSubject() {
  const folder = mkdtempSync(join(tmpdir(), "lago-goldens-"));
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
  const kept = join(folder, "Row.Default.narrow.golden");
  const orphan = join(folder, "Row.Gone.narrow.golden");
  for (const path of [kept, orphan]) writeFileSync(path, "");
  const subject = {
    file: "/project/src/Row.stories.tsx",
    folder,
    base: "Row",
    owned: new Set([kept]),
  };
  return { subject, kept, orphan };
}

describe("checkOrphans", () => {
  it("fails on a golden no story owns, naming it and what to do", () => {
    const { subject, orphan } = makeSubject();
    expect(() => checkOrphans(subject)).toThrow(
      "__goldens__ holds goldens that no story of Row.stories.tsx owns. Remove them, or run with -u.",
    );
    expect(() => checkOrphans(subject)).toThrow("Row.Gone.narrow.golden");
    expect(existsSync(orphan)).toBe(true);
  });

  it("passes when every golden has its story", () => {
    const { subject, orphan } = makeSubject();
    rmSync(orphan);
    expect(() => checkOrphans(subject)).not.toThrow();
  });

  it("removes them instead when the run updates every snapshot", () => {
    const { subject, kept, orphan } = makeSubject();
    const { snapshotState } = expect.getState();
    vi.spyOn(snapshotState, "snapshotUpdateState", "get").mockReturnValue(
      "all",
    );
    checkOrphans(subject);
    expect(existsSync(orphan)).toBe(false);
    expect(existsSync(kept)).toBe(true);
  });
});
