import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The goldens in `folder` that belong to the stories file named `base` and to
 * none of its stories. A golden is `<base>.<Story>.<viewport>.golden`, and
 * neither a story's name nor a viewport's holds a dot, so a file of another
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
      const [story, viewport, extension, ...rest] = entry
        .slice(base.length + 1)
        .split(".");
      return (
        entry.startsWith(`${base}.`) &&
        Boolean(story && viewport) &&
        extension === "golden" &&
        rest.length === 0
      );
    })
    .map((entry) => join(folder, entry))
    .filter((path) => !owned.has(path))
    .sort();
}
