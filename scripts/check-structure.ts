/**
 * Checks the shape of every source file against the repository's conventions.
 *
 * `bun scripts/check-structure.ts [root]` reads each file git tracks or would
 * track under `packages/<name>/src` and exits 1 on a finding. `--self-test`
 * runs the rules over files written to break each one and exits 0 only when
 * every break is rejected and every allowed file is accepted.
 *
 * The rules, each for a kind of file told by its name:
 * - an implementation file exports one value, as its default, and is named
 *   after it; it may also export the types of its own signature;
 * - `index.ts` and a package's entries are barrels: named re-exports only, of
 *   a file beside them or of a child folder's `index.js`, and never `export *`;
 * - `types.ts` exports only types, and `constants.ts` only named values;
 * - no import uses a `#` alias;
 * - `lago-core` imports no renderer, no React and no other Lago package, and
 *   nothing `lago-react`'s `story/` ships imports the renderer;
 * - an import that leaves its domain enters the other one through its barrel;
 * - a file stays within 500 lines unless its first line says why not.
 */
import { basename, dirname, join, normalize, relative } from "node:path";
import { parseSync } from "oxc-parser";

interface Finding {
  readonly file: string;
  readonly rule: string;
  readonly detail: string;
}

type Kind =
  | "implementation"
  | "barrel"
  | "types"
  | "constants"
  | "test"
  | "script";

const lengthLimit = 500;
const lengthExcuse = "// Longer than 500 lines because";

/** A package's entries beside its `index.ts`: barrels like it. */
const entryBarrels = new Set(["vitest.ts"]);
/** Files that are run, not imported, and so export nothing. */
const scripts = new Set(["bin.ts"]);

/**
 * Where a renderer may not be named, and why. The core is what every
 * renderer's package builds on, so a renderer, React or another Lago package
 * imported there would bind them all to it. A story is drawn through
 * whatever mounts it, so the story layer asks the mount, not a renderer;
 * its tests mount through this package's renderer, and may name it.
 */
const rendererFree: readonly {
  readonly place: RegExp;
  readonly refused: RegExp;
  readonly reason: string;
}[] = [
  {
    place: /^packages\/lago-core\/src\//,
    refused: /^(react|react-reconciler|react-dom)(\/|$)|^@opentui\/|^@aztlan\//,
    reason: "lago-core names no renderer and builds on no other Lago package",
  },
  {
    place: /^packages\/lago-react\/src\/lib\/story\/(?!.*\.test\.tsx?$)/,
    refused: /^@opentui\//,
    reason: "a story takes what it needs of its screen from whatever mounts it",
  },
];

/** `packages/<name>/src/<rest>` split into its package's source folder and the rest. */
function splitPath(file: string): { source: string; rest: string } | undefined {
  const match = /^(packages\/[^/]+\/src)\/(.+)$/.exec(file);
  const [, source, rest] = match ?? [];
  return source !== undefined && rest !== undefined
    ? { source, rest }
    : undefined;
}

function classify(rest: string): Kind {
  const name = basename(rest);
  if (/\.(test|stories)\.tsx?$/.test(name) || rest.startsWith("testing/")) {
    return "test";
  }
  if (!rest.includes("/") && scripts.has(name)) return "script";
  if (name === "index.ts" || (!rest.includes("/") && entryBarrels.has(name))) {
    return "barrel";
  }
  if (name === "types.ts") return "types";
  if (name === "constants.ts") return "constants";
  return "implementation";
}

/**
 * The domain a file belongs to: the first folder under `lib/`, or under
 * `src/` in a package that has no `lib/`. A package's entries belong to none.
 */
function findDomain(rest: string): string | undefined {
  const parts = rest.split("/");
  const start = parts.at(0) === "lib" ? 1 : 0;
  return parts.length > start + 1
    ? parts.slice(0, start + 1).join("/")
    : undefined;
}

/** The findings for one file, from its path and its text alone. */
export function checkFile(file: string, text: string): Finding[] {
  const place = splitPath(file);
  if (!place || !/\.tsx?$/.test(file) || file.endsWith(".d.ts")) return [];
  const findings: Finding[] = [];
  const report = (rule: string, detail: string) =>
    findings.push({ file, rule, detail });
  const kind = classify(place.rest);
  const lines = text.split("\n");
  if (lines.length > lengthLimit && !lines.at(0)?.startsWith(lengthExcuse)) {
    report(
      "length",
      `${lines.length} lines, and its first line gives no reason`,
    );
  }
  const { module, errors } = parseSync(file, text);
  if (errors.length > 0) {
    report("syntax", String(errors.at(0)?.message));
    return findings;
  }
  const domain = findDomain(place.rest);
  const requests = [
    ...module.staticImports.map(({ moduleRequest }) => moduleRequest.value),
    ...module.staticExports.flatMap(({ entries }) =>
      entries.flatMap(({ moduleRequest }) =>
        moduleRequest ? [moduleRequest.value] : [],
      ),
    ),
  ];
  for (const { place: where, refused, reason } of rendererFree) {
    if (!where.test(file)) continue;
    for (const request of requests.filter((each) => refused.test(each))) {
      report("renderer-free", `imports "${request}": ${reason}`);
    }
  }
  for (const { moduleRequest } of module.staticImports) {
    const request = moduleRequest.value;
    if (request.startsWith("#")) report("alias", `imports "${request}"`);
    if (!request.startsWith(".")) continue;
    const target = normalize(join(dirname(place.rest), request));
    if (target.startsWith("..") || target.startsWith("testing/")) continue;
    const other = findDomain(target);
    if (
      other !== undefined &&
      other !== domain &&
      !request.endsWith("/index.js")
    ) {
      report("barrel bypass", `imports "${request}" from another domain`);
    }
  }
  const exported = module.staticExports.flatMap(({ entries }) => entries);
  const values = exported.filter(({ isType }) => !isType);
  if (kind === "implementation") {
    const defaults = values.filter(
      ({ exportName }) => exportName.kind === "Default",
    );
    if (values.length !== 1 || defaults.length !== 1) {
      report(
        "one default export",
        `exports ${values.length} values, ${defaults.length} of them the default`,
      );
    }
    const expected = basename(place.rest).replace(/\.tsx?$/, "");
    const named = defaults.at(0)?.localName.name;
    const declared = new RegExp(
      `\\b(const|function|class)\\s+${expected}\\b`,
    ).test(text);
    if (defaults.length === 1 && named !== expected && !declared) {
      report(
        "named for its export",
        `its default export is not called ${expected}`,
      );
    }
  }
  if (kind === "barrel") {
    for (const { moduleRequest, importName, exportName } of exported) {
      const request = moduleRequest?.value;
      if (request === undefined) {
        report(
          "barrel",
          `declares ${exportName.name ?? "a value"} instead of re-exporting it`,
        );
      } else if (importName.kind !== "Name") {
        report("barrel", `re-exports everything of "${request}"`);
      } else if (
        !/^\.\/[^/]+\.js$/.test(request) &&
        !/^\.\/[^/]+\/index\.js$/.test(request)
      ) {
        report("barrel", `reaches "${request}", further than one level down`);
      }
    }
  }
  if (kind === "types" && values.length > 0) {
    report(
      "types only",
      `exports the value ${values.at(0)?.exportName.name ?? "default"}`,
    );
  }
  if (kind === "constants") {
    const wrong = exported.find(
      ({ isType, exportName, moduleRequest }) =>
        isType || exportName.kind !== "Name" || moduleRequest !== null,
    );
    if (wrong)
      report(
        "constants only",
        "exports something other than a named value of its own",
      );
  }
  return findings;
}

/** @note Impure: asks git which files the repository holds. */
function listFiles(root: string): string[] {
  const listing = Bun.spawnSync(
    [
      "git",
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "packages",
    ],
    { cwd: root },
  );
  if (listing.exitCode !== 0) {
    throw new Error(`git ls-files failed in ${root}: ${listing.stderr}`);
  }
  return listing.stdout.toString().split("\0").filter(Boolean);
}

/** @note Impure: reads the repository's files and prints what it finds. */
async function check(root: string): Promise<number> {
  const findings: Finding[] = [];
  for (const file of listFiles(root)) {
    const handle = Bun.file(join(root, file));
    if (await handle.exists())
      findings.push(...checkFile(file, await handle.text()));
  }
  for (const { file, rule, detail } of findings) {
    console.error(`${relative(".", join(root, file))}: ${rule}: ${detail}`);
  }
  if (findings.length > 0) {
    console.error(`structure check: ${findings.length} finding(s)`);
    return 1;
  }
  console.log("structure check: no findings");
  return 0;
}

const lib = "packages/example/src/lib";

/** Each file must be rejected, for the rule named beside it. */
const breaks: Record<string, [string, string]> = {
  [`${lib}/golden/helpers.ts`]: [
    "one default export",
    "export const a = 1;\nexport const b = 2;\n",
  ],
  [`${lib}/golden/formatThing.ts`]: [
    "one default export",
    "export default function formatThing() {}\nexport const extra = 1;\n",
  ],
  [`${lib}/golden/parseThing.ts`]: [
    "named for its export",
    "export default function readThing() {}\n",
  ],
  [`${lib}/golden/index.ts`]: ["barrel", 'export * from "./formatThing.js";\n'],
  [`${lib}/story/index.ts`]: ["barrel", "export const made = 1;\n"],
  [`${lib}/index.ts`]: [
    "barrel",
    'export { default as deep } from "./golden/deep/formatThing.js";\n',
  ],
  [`${lib}/golden/types.ts`]: ["types only", "export const value = 1;\n"],
  [`${lib}/golden/constants.ts`]: ["constants only", "export default 1;\n"],
  [`${lib}/render/useAlias.ts`]: [
    "alias",
    'import { a } from "#golden";\nexport default function useAlias() { return a; }\n',
  ],
  [`${lib}/render/reachIn.ts`]: [
    "barrel bypass",
    'import formatThing from "../golden/formatThing.js";\nexport default function reachIn() { return formatThing; }\n',
  ],
  "packages/lago-core/src/lib/screen/drawScreen.ts": [
    "renderer-free",
    'import { createElement } from "react";\nexport default function drawScreen() { return createElement; }\n',
  ],
  "packages/lago-core/src/lib/screen/index.ts": [
    "renderer-free",
    'export { render } from "@aztlan/lago-react";\n',
  ],
  "packages/lago-react/src/lib/story/SizedFrame.tsx": [
    "renderer-free",
    'import { useTerminalDimensions } from "@opentui/react";\nexport default function SizedFrame() { return useTerminalDimensions(); }\n',
  ],
  [`${lib}/render/growLong.ts`]: [
    "length",
    `export default function growLong() {}\n${"\n".repeat(lengthLimit)}`,
  ],
};

/** Each file must be accepted. */
const allowed: Record<string, string> = {
  [`${lib}/render/formatRun.ts`]:
    'import type { Run } from "./types.js";\nimport { parse } from "../golden/index.js";\nexport interface Options { wide: boolean }\nexport default function formatRun(run: Run, options: Options) { return parse(run, options); }\n',
  [`${lib}/render/Picture.tsx`]:
    "const Picture = () => null;\n\nexport default Picture;\n",
  [`${lib}/render/index.ts`]:
    'export { default as formatRun } from "./formatRun.js";\nexport type { Run } from "./types.js";\nexport { Deep } from "./deep/index.js";\n',
  [`${lib}/render/types.ts`]:
    "export interface Run { text: string }\nexport type Color = string;\n",
  [`${lib}/render/constants.ts`]: "export const limit = 3;\n",
  [`${lib}/render/formatRun.test.ts`]:
    'import formatRun from "./formatRun.js";\nimport { fixture } from "../../../testing/fixtures.js";\nexport const anything = [formatRun, fixture];\n',
  "packages/example/src/index.ts":
    'export { formatRun } from "./lib/index.js";\n',
  "packages/example/src/vitest.ts":
    'export { testStories } from "./lib/index.js";\n',
  "packages/example/src/bin.ts":
    'import { start } from "./gallery/index.js";\nstart();\n',
  [`${lib}/render/explainLength.ts`]: `${lengthExcuse} it is a table.\nexport default function explainLength() {}\n${"\n".repeat(lengthLimit)}`,
  "packages/example/README.md": "export * from everything\n",
  "packages/lago-core/src/lib/screen/waitLong.ts":
    'import { onTestFinished } from "vitest";\nexport default function waitLong() { return onTestFinished; }\n',
  "packages/lago-react/src/lib/story/SizedFrame.test.tsx":
    'import { useKeyboard } from "@opentui/react";\nexport const fixture = useKeyboard;\n',
  "packages/lago-react/src/lib/render/mountScreen.ts":
    'import { createRoot } from "@opentui/react";\nexport default function mountScreen() { return createRoot; }\n',
};

function selfTest(): number {
  const failures: string[] = [];
  for (const [file, [rule, text]] of Object.entries(breaks)) {
    if (!checkFile(file, text).some((finding) => finding.rule === rule)) {
      failures.push(`${file} was not rejected for "${rule}"`);
    }
  }
  for (const [file, text] of Object.entries(allowed)) {
    const [finding] = checkFile(file, text);
    if (finding)
      failures.push(
        `${file} was rejected for "${finding.rule}": ${finding.detail}`,
      );
  }
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) return 1;
  console.log(
    `structure self-test: ${Object.keys(breaks).length} breaks rejected, ${Object.keys(allowed).length} files accepted`,
  );
  return 0;
}

if (import.meta.main) {
  const [argument] = process.argv.slice(2);
  process.exitCode =
    argument === "--self-test"
      ? selfTest()
      : await check(argument ?? process.cwd());
}
