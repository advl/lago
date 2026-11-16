/**
 * Refuses a commit whose message would not belong on the main branch.
 *
 * `bun scripts/check-commits.ts` reads every commit reachable from `HEAD` and
 * exits 1 on a finding. It reads all of them, and not a range, because a
 * range that resolves to nothing passes in silence. Merge commits are left
 * out: main's history is linear, so the only merge a run sees is the one the
 * pipeline makes to test a pull request against its base. `--self-test` runs the
 * rules over messages written to break each one and exits 0 only when every
 * break is rejected and every allowed message is accepted.
 *
 * The rules: the subject is `type(scope): description`, with a known type and
 * a known scope; it stays within 72 characters; its description opens with a
 * verb in the third person and does not end in a full stop; and the message
 * credits a co-author at most once.
 */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

interface Commit {
  readonly hash: string;
  readonly subject: string;
  readonly body: string;
}

const types = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "test",
];

/** A package's short name, or what belongs to no package. */
const scopes = [
  "lago-core",
  "lago-react",
  "lago-config",
  "tui",
  "lago",
  "monorepo",
  "deps",
  "ci",
];

const lengthLimit = 72;

/** The number a squash merge appends to a subject is not part of it. */
const mergeNumber = / \(#\d+\)$/;

/** Every rule one message breaks, in words. */
export function checkMessage(subject: string, body: string): string[] {
  const findings: string[] = [];
  if (subject.length > lengthLimit) {
    findings.push(`is ${subject.length} characters long, over ${lengthLimit}`);
  }
  const shape = /^([a-z]+)\(([^)]*)\)!?: (.+)$/.exec(
    subject.replace(mergeNumber, ""),
  );
  const [, type = "", scope = "", description = ""] = shape ?? [];
  if (!shape) {
    findings.push("is not written as type(scope): description");
    return findings;
  }
  if (!types.includes(type)) findings.push(`has the unknown type "${type}"`);
  for (const each of scope.split(",")) {
    if (!scopes.includes(each))
      findings.push(`has the unknown scope "${each}"`);
  }
  if (!/^[a-z]+s\b/.test(description)) {
    findings.push("does not open with a verb in the third person");
  }
  if (description.endsWith(".")) findings.push("ends in a full stop");
  const credits = body
    .split("\n")
    .filter((line) => /^co-authored-by:/i.test(line));
  if (credits.length > 1) {
    findings.push(`credits a co-author ${credits.length} times`);
  }
  return findings;
}

/** @note Impure: asks git for the history. */
function listCommits(root: string): Commit[] {
  const log = execFileSync(
    "git",
    ["log", "--no-merges", "--format=%H%x00%s%x00%b%x01"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  return log
    .split("\x01")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash = "", subject = "", body = ""] = entry.split("\0");
      return { hash, subject, body };
    });
}

/** @note Impure: prints what it finds. */
function check(root: string): number {
  const commits = listCommits(root);
  if (commits.length === 0) {
    console.error("check:commits found no commit to read");
    return 1;
  }
  let count = 0;
  for (const { hash, subject, body } of commits) {
    for (const finding of checkMessage(subject, body)) {
      console.error(`${hash.slice(0, 7)} "${subject}" ${finding}`);
      count += 1;
    }
  }
  if (count > 0) {
    console.error(`check:commits: ${count} finding(s)`);
    return 1;
  }
  console.log(`check:commits: ${commits.length} commits clean`);
  return 0;
}

const credit = "Co-Authored-By: Example <someone@example.com>";

/** Each message must be rejected, for the finding that starts as written. */
const breaks: [string, string, string][] = [
  ["adds a thing", "", "is not written"],
  ["feat: adds a thing", "", "is not written"],
  ["feature(tui): adds a thing", "", "has the unknown type"],
  ["feat(button): adds a thing", "", "has the unknown scope"],
  ["feat(tui,button): adds a thing", "", "has the unknown scope"],
  ["feat(tui): add a thing", "", "does not open with a verb"],
  ["feat(tui): Adds a thing", "", "does not open with a verb"],
  ["feat(tui): adds a thing.", "", "ends in a full stop"],
  [`feat(tui): adds ${"a".repeat(lengthLimit)}`, "", "is 88 characters long"],
  ["feat(tui): adds a thing", `${credit}\n${credit}`, "credits a co-author"],
];

/** Each message must be accepted. */
const allowed: [string, string][] = [
  ["feat(tui): adds a thing", ""],
  ["fix(lago-react,lago-config): passes the viewports through", credit],
  ["feat(lago)!: renames the binary", "BREAKING CHANGE: the binary is renamed"],
  ["chore(deps): bumps vitest to 5.2 (#12)", ""],
];

function selfTest(): number {
  const failures: string[] = [];
  for (const [subject, body, expected] of breaks) {
    if (
      !checkMessage(subject, body).some((each) => each.startsWith(expected))
    ) {
      failures.push(`"${subject}" was not rejected: ${expected}`);
    }
  }
  for (const [subject, body] of allowed) {
    const [finding] = checkMessage(subject, body);
    if (finding) failures.push(`"${subject}" was rejected: ${finding}`);
  }
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) return 1;
  console.log(
    `check:commits self-test: ${breaks.length} breaks rejected, ${allowed.length} messages accepted`,
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
