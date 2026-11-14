/**
 * Refuses a dependency that ships with a package under a licence that is not
 * permissive.
 *
 * `bun scripts/check-licences.ts` follows the `dependencies` of each package
 * under `packages/`, and theirs in turn, through the installed tree, and
 * exits 1 on a licence outside the allowed list. `--self-test` builds a
 * scratch project with a copyleft dependency behind a permissive one and
 * exits 0 only when the check rejects the one and accepts the other.
 *
 * Only `dependencies` are installed with a package, which ships under MIT.
 * Development tools never ship, and a peer is the consumer's own choice, so
 * their licences bind nothing here.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

interface Manifest {
  readonly name: string;
  readonly version?: string;
  readonly license?: string;
  readonly dependencies?: Readonly<Record<string, string>>;
}

const permissive = [
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "ISC",
  "MIT",
  "Unlicense",
];

/** Whether a licence expression can be met with a permissive licence alone. */
export function isPermissive(expression: string | undefined): boolean {
  if (expression === undefined) return false;
  const plain = expression.replace(/[()]/g, "");
  if (plain.includes(" OR ")) return plain.split(" OR ").some(isPermissive);
  if (plain.includes(" AND ")) return plain.split(" AND ").every(isPermissive);
  return permissive.includes(plain.trim());
}

/** @note Impure: reads the file system. */
function readManifest(folder: string): Manifest {
  return JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
}

/**
 * The folder a dependency is installed in, as Node finds it from `from`:
 * the nearest `node_modules` above that holds it, with links followed.
 *
 * @note Impure: reads the file system.
 */
function findInstalled(name: string, from: string): string | undefined {
  for (let folder = from; ; folder = dirname(folder)) {
    const candidate = join(folder, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) {
      return realpathSync(candidate);
    }
    if (dirname(folder) === folder) return undefined;
  }
}

/**
 * Every dependency that ships with the package in `folder` and may not.
 *
 * @note Impure: reads the installed tree.
 */
function listRefused(folder: string): string[] {
  const refused: string[] = [];
  const seen = new Set<string>();
  const queue = [realpathSync(folder)];
  for (let from = queue.shift(); from !== undefined; from = queue.shift()) {
    for (const name of Object.keys(readManifest(from).dependencies ?? {})) {
      const installed = findInstalled(name, from);
      if (installed === undefined) {
        refused.push(`${name} is not installed, so its licence is unknown`);
        continue;
      }
      if (seen.has(installed)) continue;
      seen.add(installed);
      const { version, license } = readManifest(installed);
      if (!isPermissive(license)) {
        refused.push(`${name}@${version} is under ${license ?? "no licence"}`);
      }
      queue.push(installed);
    }
  }
  return refused;
}

/** @note Impure: prints what it finds. */
function check(root: string): number {
  const folders = readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, "packages", entry.name));
  if (folders.length === 0) {
    console.error("check:licences found no package to read");
    return 1;
  }
  let count = 0;
  for (const folder of folders) {
    for (const finding of listRefused(folder)) {
      console.error(`${readManifest(folder).name}: ${finding}`);
      count += 1;
    }
  }
  if (count > 0) {
    console.error(`check:licences: ${count} finding(s)`);
    return 1;
  }
  console.log(
    `check:licences: what ships with ${folders.length} packages is permissive`,
  );
  return 0;
}

/** @note Impure: writes a scratch project and removes it. */
function selfTest(): number {
  const root = mkdtempSync(join(tmpdir(), "licences-fixture-"));
  const write = (folder: string, manifest: Manifest) => {
    mkdirSync(join(root, folder), { recursive: true });
    writeFileSync(join(root, folder, "package.json"), JSON.stringify(manifest));
  };
  try {
    write("", {
      name: "example-app",
      license: "MIT",
      dependencies: { "example-permissive": "1.0.0" },
    });
    write("node_modules/example-permissive", {
      name: "example-permissive",
      version: "1.0.0",
      license: "(MIT OR GPL-3.0-only)",
      dependencies: { "example-copyleft": "1.0.0", "example-absent": "1.0.0" },
    });
    write("node_modules/example-copyleft", {
      name: "example-copyleft",
      version: "1.0.0",
      license: "GPL-3.0-only",
    });
    const refused = listRefused(root);
    const expected = [
      "example-copyleft@1.0.0 is under GPL-3.0-only",
      "example-absent is not installed, so its licence is unknown",
    ];
    if (JSON.stringify(refused) !== JSON.stringify(expected)) {
      console.error("check:licences self-test: expected", expected);
      console.error("check:licences self-test: found", refused);
      return 1;
    }
    console.log(
      "check:licences self-test: the copyleft and the absent dependency rejected, the permissive one accepted",
    );
    return 0;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const [argument] = process.argv.slice(2);
  process.exitCode =
    argument === "--self-test"
      ? selfTest()
      : check(argument ?? resolve(import.meta.dirname, ".."));
}
