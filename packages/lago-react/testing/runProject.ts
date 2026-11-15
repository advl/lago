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
import { basename, dirname, join, resolve } from "node:path";
import { onTestFinished } from "vitest";
import type { StoryResult } from "../src/vitest.js";

/** One test of a run, as vitest's own report gives it. */
export interface Outcome {
  readonly name: string;
  readonly status: string;
  readonly failures: readonly string[];
  readonly story: StoryResult | undefined;
}

/** A scratch project after a run of vitest in it. */
export interface Run {
  readonly outcomes: readonly Outcome[];
  /** What failed outside any test, such as a file that could not be loaded, by file. */
  readonly errors: Readonly<Record<string, string>>;
  /** What vitest printed, to show when a run did not go as expected. */
  readonly output: string;
  readonly exists: (file: string) => boolean;
  readonly read: (file: string) => string;
  /** Runs vitest in the same project again, as after an edit. */
  readonly again: (
    files?: Readonly<Record<string, string>>,
    ...flags: string[]
  ) => Promise<Run>;
}

/** One file of vitest's own report. */
interface Report {
  readonly name: string;
  readonly message: string;
  readonly assertionResults: readonly {
    readonly fullName: string;
    readonly status: string;
    readonly failureMessages: readonly string[];
    readonly meta: { readonly lago?: StoryResult };
  }[];
}

const source = resolve(import.meta.dirname, "../src");

/** The configuration of a scratch project: this package's plugin, from its source, at one small size. */
const config = `import { defineConfig } from "vitest/config";
import testStories from ${JSON.stringify(join(source, "lib/vitest/testStories.ts"))};

export default defineConfig({
  plugins: [testStories({ viewports: { small: { cols: 20, rows: 3 } } })],
  oxc: { jsx: { runtime: "automatic", importSource: "@opentui/react" } },
  ssr: { resolve: { conditions: ["bun"] } },
  test: {
    include: ["**/*.stories.tsx", "**/*.test.tsx"],
    // Kept in the project, which is removed with it.
    fsModuleCachePath: ".vitest-cache",
  },
});
`;

/** The line a scratch file imports this package's entry with. */
export const entry = JSON.stringify(join(source, "index.ts"));

/**
 * What a scratch run sees of the environment: what finds the tools and
 * nothing else. In particular nothing that tells vitest it runs in a
 * pipeline, such as `CI` or `GITHUB_ACTIONS`, unless the run asks for it.
 *
 * @note Impure: reads the environment.
 */
function readEnvironment(ci: boolean): Record<string, string> {
  const kept = ["PATH", "HOME", "TMPDIR", "LANG"].flatMap((name) => {
    const value = process.env[name];
    return value === undefined ? [] : [[name, value] as const];
  });
  return { ...Object.fromEntries(kept), ...(ci ? { CI: "true" } : {}) };
}

/** @note Impure: writes the files, runs vitest in the project, and reads its report. */
async function run(
  root: string,
  files: Readonly<Record<string, string>>,
  flags: readonly string[],
): Promise<Run> {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  const report = join(root, "report.json");
  rmSync(report, { force: true });
  const ci = flags.includes("--ci");
  const child = Bun.spawn(
    [
      process.execPath,
      "x",
      "--bun",
      "vitest",
      "run",
      "--reporter=json",
      `--outputFile=${report}`,
      ...flags.filter((flag) => flag !== "--ci"),
    ],
    { cwd: root, env: readEnvironment(ci), stdout: "pipe", stderr: "pipe" },
  );
  const [stdout, stderr] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  const { testResults = [] } = existsSync(report)
    ? JSON.parse(readFileSync(report, "utf8"))
    : {};
  const outcomes: Outcome[] = testResults.flatMap((file: Report) =>
    file.assertionResults.map((test) => ({
      name: test.fullName,
      status: test.status,
      failures: test.failureMessages,
      story: test.meta.lago,
    })),
  );
  const errors = Object.fromEntries(
    testResults
      .filter((file: Report) => file.message !== "")
      .map((file: Report) => [basename(file.name), file.message]),
  );
  return {
    outcomes,
    errors,
    output: `${stdout}${stderr}`,
    exists: (file) => existsSync(join(root, file)),
    read: (file) => readFileSync(join(root, file), "utf8"),
    again: (more = {}, ...next) => run(root, more, next),
  };
}

/**
 * Writes `files` into a scratch project that uses this package's plugin, runs
 * vitest there as a person would, and gives what happened. `--ci` among the
 * flags runs it as a pipeline does, where a missing snapshot is not written.
 * The project is removed when the test ends.
 *
 * The project stands outside this repository, with this package's installed
 * dependencies linked in, so nothing it writes can be committed. Its removal
 * is tied to the running test, so it is not for tests that run concurrently.
 *
 * @note Impure: writes a temporary folder and runs a process.
 */
export default function runProject(
  files: Readonly<Record<string, string>>,
  ...flags: string[]
): Promise<Run> {
  const root = mkdtempSync(join(tmpdir(), "lago-project-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  symlinkSync(resolve(source, "../node_modules"), join(root, "node_modules"));
  const scaffold = {
    "package.json": JSON.stringify({ type: "module" }),
    "vitest.config.ts": config,
  };
  return run(root, { ...scaffold, ...files }, flags);
}
