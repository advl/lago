import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { onTestFinished } from "vitest";

const packageRoot = resolve(import.meta.dirname, "..");

/**
 * Writes `files` into a scratch project configured by createConfig, with
 * this package's installed dependencies linked in, and gives its root. The
 * project is removed when the test ends.
 *
 * @note Impure: writes a temporary folder.
 */
export default function makeProject(
  files: Readonly<Record<string, string>>,
): string {
  const root = mkdtempSync(join(tmpdir(), "lago-gallery-project-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  symlinkSync(join(packageRoot, "node_modules"), join(root, "node_modules"));
  const scaffold = {
    "package.json": JSON.stringify({ type: "module" }),
    "vitest.config.ts": `import { createConfig } from "@aztlan/lago-config";
import { mergeConfig } from "vitest/config";

export default mergeConfig(
  createConfig({ viewports: { small: { cols: 20, rows: 3 } } }),
  { test: { fsModuleCachePath: ".vitest-cache" } },
);
`,
  };
  for (const [file, text] of Object.entries({ ...scaffold, ...files })) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  return root;
}
