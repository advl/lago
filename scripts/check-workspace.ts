/**
 * Holds every package to the workspace's shape.
 *
 * `bun scripts/check-workspace.ts` reads each `packages/<folder>/package.json`
 * and exits 1 on a finding. `--self-test` runs the rules over manifests
 * written to break each one and exits 0 only when every break is rejected and
 * the allowed manifest is accepted.
 *
 * The task runner skips a package that lacks the target it is asked for, and
 * says nothing. So a package without a `ci` target, or with one that leaves a
 * gate out, would be selected by the pipeline and run nothing. This gate is
 * what makes that a failure.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface Manifest {
  readonly name?: string;
  readonly version?: string;
  readonly license?: string;
  readonly scripts?: Readonly<Record<string, string>>;
  readonly engines?: Readonly<Record<string, string>>;
  readonly nx?: {
    readonly targets?: Readonly<
      Record<string, { readonly dependsOn?: readonly string[] }>
    >;
  };
}

const scope = "@aztlan/";
const licence = "MIT";

/** The scripts the root runs in every package. */
const scripts = ["build", "check", "check:fix", "test", "test:coverage"];

/** What a package's `ci` target is made of. */
const gate = ["build", "check", "test:coverage"];

/** Every rule one package's manifest breaks, in words. */
export function checkPackage(
  folder: string,
  manifest: Manifest,
  version: string,
): string[] {
  const findings: string[] = [];
  if (manifest.name !== `${scope}${folder}`) {
    findings.push(`is named ${manifest.name}, not ${scope}${folder}`);
  }
  if (manifest.version !== version) {
    findings.push(
      `is at version ${manifest.version}, not the shared ${version}`,
    );
  }
  if (manifest.license !== licence) {
    findings.push(`declares the licence ${manifest.license}, not ${licence}`);
  }
  if (!manifest.engines?.bun) findings.push("names no Bun version in engines");
  for (const script of scripts) {
    if (!manifest.scripts?.[script]) findings.push(`has no ${script} script`);
  }
  const made = manifest.nx?.targets?.ci?.dependsOn;
  if (!made) {
    findings.push("declares no ci target");
  } else {
    for (const target of gate) {
      if (!made.includes(target)) {
        findings.push(`leaves ${target} out of its ci target`);
      }
    }
  }
  return findings;
}

/** @note Impure: reads the manifests and prints what it finds. */
function check(root: string): number {
  const { version } = JSON.parse(
    readFileSync(join(root, "lerna.json"), "utf8"),
  ) as { version: string };
  const folders = readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  if (folders.length === 0) {
    console.error("check:workspace found no package to read");
    return 1;
  }
  let count = 0;
  for (const folder of folders) {
    const manifest = JSON.parse(
      readFileSync(join(root, "packages", folder, "package.json"), "utf8"),
    ) as Manifest;
    for (const finding of checkPackage(folder, manifest, version)) {
      console.error(`packages/${folder} ${finding}`);
      count += 1;
    }
  }
  if (count > 0) {
    console.error(`check:workspace: ${count} finding(s)`);
    return 1;
  }
  console.log(`check:workspace: ${folders.length} packages in shape`);
  return 0;
}

const sound: Manifest = {
  name: "@aztlan/example",
  version: "1.2.3",
  license: licence,
  scripts: Object.fromEntries(scripts.map((script) => [script, "true"])),
  engines: { bun: ">=1.0.0" },
  nx: { targets: { ci: { dependsOn: gate } } },
};

/** Each manifest must be rejected, for the finding that starts as written. */
const breaks: [Manifest, string][] = [
  [{ ...sound, name: "example" }, "is named"],
  [{ ...sound, name: "@aztlan/other" }, "is named"],
  [{ ...sound, version: "1.2.4" }, "is at version"],
  [{ ...sound, license: "ISC" }, "declares the licence"],
  [{ ...sound, engines: {} }, "names no Bun version"],
  [{ ...sound, scripts: { build: "true" } }, "has no check script"],
  [{ ...sound, nx: undefined }, "declares no ci target"],
  [
    { ...sound, nx: { targets: { ci: { dependsOn: ["build", "check"] } } } },
    "leaves test:coverage out",
  ],
];

function selfTest(): number {
  const failures: string[] = [];
  for (const [manifest, expected] of breaks) {
    const findings = checkPackage("example", manifest, "1.2.3");
    if (!findings.some((each) => each.startsWith(expected))) {
      failures.push(`a manifest was not rejected: ${expected}`);
    }
  }
  const [finding] = checkPackage("example", sound, "1.2.3");
  if (finding) failures.push(`the sound manifest was rejected: ${finding}`);
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) return 1;
  console.log(
    `check:workspace self-test: ${breaks.length} breaks rejected, the sound manifest accepted`,
  );
  return 0;
}

if (import.meta.main) {
  const [argument] = process.argv.slice(2);
  process.exitCode =
    argument === "--self-test"
      ? selfTest()
      : check(argument ?? resolve(import.meta.dirname, ".."));
}
