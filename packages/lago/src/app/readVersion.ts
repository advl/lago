import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * The version in the nearest `package.json` at or above `folder`, which is
 * the package's own whether it runs from its source or from its build.
 *
 * @note Impure: reads the file system.
 */
export default function readVersion(folder: string): string {
  const manifest = join(folder, "package.json");
  if (existsSync(manifest)) {
    const { version } = JSON.parse(readFileSync(manifest, "utf8")) as {
      version: string;
    };
    return version;
  }
  const parent = dirname(folder);
  if (parent === folder) throw new Error(`No package.json above ${folder}.`);
  return readVersion(parent);
}
