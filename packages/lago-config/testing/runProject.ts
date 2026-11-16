import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { onTestFinished } from "vitest";

/** A scratch project after a run of vitest in it. */
export interface Run {
  /** Each test's full name and how it ended, in the report's order. */
  readonly outcomes: readonly (readonly [name: string, status: string])[];
  /** What vitest printed, to show when a run did not go as expected. */
  readonly output: string;
  readonly exists: (file: string) => boolean;
  readonly read: (file: string) => string;
}

const packageRoot = resolve(import.meta.dirname, "..");

/**
 * The configuration of a scratch project: one call of this package's
 * function, from its source, with whatever else `options` adds to its
 * options, written as source.
 */
export const configure = (
  options = "",
) => `import { mergeConfig } from "vitest/config";
import createConfig from ${JSON.stringify(join(packageRoot, "src/lib/createConfig.ts"))};

export default mergeConfig(
  createConfig({ viewports: { small: { cols: 20, rows: 3 } }, coverage: true${options} }),
  // Kept in the project, which is removed with it.
  { test: { fsModuleCachePath: ".vitest-cache" } },
);
`;

/**
 * What a scratch run sees of the environment: what finds the tools and
 * nothing else, so nothing tells vitest it runs in a pipeline.
 *
 * @note Impure: reads the environment.
 */
function readEnvironment(): Record<string, string> {
  const kept = ["PATH", "HOME", "TMPDIR", "LANG"].flatMap((name) => {
    const value = process.env[name];
    return value === undefined ? [] : [[name, value] as const];
  });
  return Object.fromEntries(kept);
}

/**
 * Writes `files` into a scratch project whose configuration is one call of
 * `createConfig`, runs vitest there as a person would, and gives what
 * happened. The project is removed when the test ends.
 *
 * The project stands outside this repository, with this package's installed
 * dependencies linked in, so it resolves the stories library as a project
 * that installed it would: through its built entry.
 *
 * @note Impure: writes a temporary folder and runs a process.
 */
export default async function runProject(
  files: Readonly<Record<string, string>>,
  ...flags: string[]
): Promise<Run> {
  const root = mkdtempSync(join(tmpdir(), "lago-config-project-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  symlinkSync(join(packageRoot, "node_modules"), join(root, "node_modules"));
  const scaffold = {
    "package.json": JSON.stringify({ type: "module" }),
    "vitest.config.ts": configure(),
  };
  for (const [file, text] of Object.entries({ ...scaffold, ...files })) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  const report = join(root, "report.json");
  const child = Bun.spawn(
    [
      process.execPath,
      "x",
      "--bun",
      "vitest",
      "run",
      "--reporter=json",
      `--outputFile=${report}`,
      ...flags,
    ],
    { cwd: root, env: readEnvironment(), stdout: "pipe", stderr: "pipe" },
  );
  const [stdout, stderr] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  const { testResults = [] } = existsSync(report)
    ? JSON.parse(readFileSync(report, "utf8"))
    : {};
  const outcomes = testResults.flatMap(
    (file: { assertionResults: { fullName: string; status: string }[] }) =>
      file.assertionResults.map(
        ({ fullName, status }) => [fullName, status] as const,
      ),
  );
  return {
    outcomes,
    output: `${stdout}${stderr}`,
    exists: (file) => existsSync(join(root, file)),
    read: (file) => readFileSync(join(root, file), "utf8"),
  };
}
