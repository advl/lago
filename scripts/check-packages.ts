/**
 * Checks the packages as a project outside this repository receives them.
 *
 * `bun scripts/check-packages.ts` packs each package under `packages/`,
 * which must be built, and installs the five tarballs into an empty project
 * with the renderer, React and vitest beside them. There it checks that
 * each entry exports exactly the names listed here, that a stories file
 * drawing one of the shared components is drawn, kept as a golden and then
 * checked against it, and that the `lago` binary runs. Before that, each
 * package passes publint and Are the Types Wrong, as an ES module. It exits
 * 1 on the first difference.
 *
 * The list is the published surface: a name added to an entry, or taken
 * from one, fails here until it is added here too, in the commit that
 * changes the surface.
 */
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const surface: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  "@aztlan/lago-core": {
    ".": [
      "attributeNames",
      "createScreen",
      "defaultViewport",
      "formatGolden",
      "normalizeRuns",
      "parseGolden",
      "registerSerializer",
      "stoppedTimers",
      "waitFor",
    ],
  },
  "@aztlan/lago-react": {
    ".": ["composeStories", "render", "waitFor"],
    "./vitest": ["testStories"],
  },
  "@aztlan/lago-config": { ".": ["createConfig"] },
  "@aztlan/tui": {
    ".": [
      "EmptyState",
      "GroupHeading",
      "HelpOverlay",
      "KeyBar",
      "Keys",
      "Loading",
      "Notice",
      "Pane",
      "PaneHeader",
      "ScrolledList",
      "createKeymap",
      "endRuns",
      "fitBlock",
      "fitField",
      "fitRules",
      "fitRuns",
      "giveWay",
      "measurePieces",
      "measureText",
      "noBreakSpace",
      "tokens",
      "useCommands",
      "useListScroll",
    ],
  },
  // The gallery is its binary. Its entry exports nothing, and is there only
  // because a package's manifest names one.
  "@aztlan/lago": { ".": [] },
};

/** The peers a project brings, at the versions this repository tests with. */
const peers = [
  "@opentui/core",
  "@opentui/keymap",
  "@opentui/react",
  "react",
  "vitest",
];

const repository = resolve(import.meta.dirname, "..");
const scratch = mkdtempSync(join(tmpdir(), "lago-packages-"));

/** Runs `command` in `cwd` with only the variables a person's shell would give it, and gives its output. */
const run = (command: string, args: readonly string[], cwd: string) =>
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      TMPDIR: tmpdir(),
      LANG: "C.UTF-8",
    },
  });

const fail = (message: string): never => {
  console.error(`check:packages: ${message}`);
  rmSync(scratch, { recursive: true, force: true });
  process.exit(1);
};

const tarballs: Record<string, string> = {};
const versions: Record<string, string> = {};
for (const folder of readdirSync(join(repository, "packages"))) {
  const at = join(repository, "packages", folder);
  const manifest = JSON.parse(readFileSync(join(at, "package.json"), "utf8"));
  run("bun", ["pm", "pack", "--destination", scratch, "--quiet"], at);
  // The whole name, version included: one package's name can begin
  // another's, as `aztlan-lago` begins `aztlan-lago-core`.
  const expected = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;
  const tarball = readdirSync(scratch).find((file) => file === expected);
  if (!tarball) fail(`${manifest.name} did not pack`);
  tarballs[manifest.name] = `file:${join(scratch, String(tarball))}`;
  Object.assign(versions, manifest.devDependencies);
  // The manifest's fields and entries as a registry and Node read them, and
  // the declarations as TypeScript resolves them from an ES module.
  try {
    run(join(repository, "node_modules/.bin/publint"), ["--strict", at], at);
    run(
      join(repository, "node_modules/.bin/attw"),
      ["--pack", at, "--profile", "esm-only"],
      at,
    );
  } catch (error) {
    fail(`${manifest.name} is not clean as published: ${String(error)}`);
  }
}
if (
  Object.keys(tarballs).sort().join() !== Object.keys(surface).sort().join()
) {
  fail(
    `the packages are ${Object.keys(tarballs).join(", ")}, the surface lists ${Object.keys(surface).join(", ")}`,
  );
}

const project = join(scratch, "project");
mkdirSync(join(project, "src"), { recursive: true });
const files: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "outside",
      private: true,
      type: "module",
      dependencies: Object.fromEntries([
        ...Object.entries(tarballs),
        ...peers.map((name) => [
          name,
          versions[name] ?? fail(`no version of ${name} to install`),
        ]),
      ]),
      // A package's dependency on another of them is met by its tarball.
      overrides: tarballs,
    },
    null,
    2,
  ),
  "vitest.config.ts":
    'import { createConfig } from "@aztlan/lago-config";\n\nexport default createConfig({ viewports: { small: { cols: 30, rows: 2 } } });\n',
  "src/Waiting.stories.tsx":
    'import type { Meta, StoryObj } from "@aztlan/lago-react";\nimport { Loading } from "@aztlan/tui";\n\nconst meta = {\n  title: "outside/Waiting",\n  component: Loading,\n  args: { label: { text: "reading…", kind: "words" }, width: 20 },\n} satisfies Meta<typeof Loading>;\n\nexport default meta;\n\n/** A read under way. */\nexport const Reading: StoryObj<typeof meta> = {};\n',
  "exports.ts": `const surface = ${JSON.stringify(surface)};\nconst found = {};\nfor (const [name, entries] of Object.entries(surface)) {\n  found[name] = {};\n  for (const entry of Object.keys(entries)) {\n    const module = await import(entry === "." ? name : name + entry.slice(1));\n    found[name][entry] = Object.keys(module).sort();\n  }\n}\nconsole.log(JSON.stringify(found));\n`,
};
for (const [file, text] of Object.entries(files))
  writeFileSync(join(project, file), text);

try {
  run("bun", ["install"], project);
} catch (error) {
  fail(`the tarballs did not install: ${String(error)}`);
}

const found = JSON.parse(run("bun", ["exports.ts"], project));
for (const [name, entries] of Object.entries(surface)) {
  for (const [entry, names] of Object.entries(entries)) {
    const exported = found[name]?.[entry] ?? [];
    if (exported.join() !== [...names].sort().join()) {
      fail(
        `${name} ${entry} exports ${exported.join(", ")}; the surface lists ${[...names].sort().join(", ")}`,
      );
    }
  }
}

try {
  run("bunx", ["--bun", "vitest", "run", "--project", "stories"], project);
  run("bunx", ["--bun", "vitest", "run", "--project", "stories"], project);
} catch (error) {
  fail(
    `the stories file did not pass outside the repository: ${String(error)}`,
  );
}
const golden = join(project, "src/__goldens__/Waiting.Reading.small.golden");
if (!readFileSync(golden, "utf8").includes("reading…"))
  fail("the golden does not hold the story's text");

const version = run(
  join(project, "node_modules/.bin/lago"),
  ["--version"],
  project,
).trim();
const expected = JSON.parse(
  readFileSync(join(repository, "lerna.json"), "utf8"),
).version;
if (version !== expected)
  fail(`lago --version says ${version}, the repository is at ${expected}`);

rmSync(scratch, { recursive: true, force: true });
console.log(
  `check:packages: ${Object.keys(surface).length} packages install from their tarballs, export what is listed, draw a story and run lago ${version}`,
);
