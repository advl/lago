import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { goldenCell } from "./constants.js";

/**
 * The goldens in `folder` that belong to the stories file named `base` and to
 * none of its stories. A golden is `<base>.<Story>.<viewport>.golden`, or
 * `<base>.<Story>.<viewport>@<mode>.golden` for a mode's, and neither a
 * story's name, a viewport's nor a mode's holds a dot, so a file of another
 * stories file whose name merely starts the same is not taken for one.
 *
 * @note Impure: reads the folder.
 */
export default function listOrphans(
  folder: string,
  base: string,
  owned: ReadonlySet<string>,
): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((entry) => {
      const [story, cell = "", extension, ...rest] = entry
        .slice(base.length + 1)
        .split(".");
      return (
        entry.startsWith(`${base}.`) &&
        Boolean(story) &&
        goldenCell.test(cell) &&
        extension === "golden" &&
        rest.length === 0
      );
    })
    .map((entry) => join(folder, entry))
    .filter((path) => !owned.has(path))
    .sort();
}
