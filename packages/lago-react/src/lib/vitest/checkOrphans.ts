import { rmSync } from "node:fs";
import { basename } from "node:path";
import { expect } from "vitest";
import { goldenFolder } from "./constants.js";
import listOrphans from "./listOrphans.js";

interface Subject {
  /** The stories file, for the failure's message. */
  readonly file: string;
  readonly folder: string;
  readonly base: string;
  readonly owned: ReadonlySet<string>;
}

/**
 * Fails when the folder of goldens holds one that no story of the file owns,
 * as after a story is renamed or removed. Under an update of every snapshot
 * it removes them instead, as vitest does with its own.
 *
 * @note Impure: reads the folder, and under an update removes files from it.
 */
export default function checkOrphans({
  file,
  folder,
  base,
  owned,
}: Subject): void {
  const orphans = listOrphans(folder, base, owned);
  // Read as the test runs, not when the file was loaded: in watch mode a
  // run that updates every snapshot is asked for after the files are.
  const update = expect.getState().snapshotState?.snapshotUpdateState === "all";
  if (update) {
    for (const orphan of orphans) rmSync(orphan);
    return;
  }
  expect(
    orphans.map((orphan) => basename(orphan)),
    `${goldenFolder} holds goldens that no story of ${basename(file)} owns. Remove them, or run with -u.`,
  ).toEqual([]);
}
