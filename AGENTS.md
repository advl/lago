# AGENTS.md

Instructions for whoever works on this repository. Everything here is true at the commit that carries it.

## Commands

`bun run` is the task face: every gate is a script in a `package.json`.

| Command | What it does |
|---|---|
| `bun install` | Installs the toolchain. The lockfile is `bun.lock`; the pipeline installs with `--frozen-lockfile`. |
| `bun run build` | In every package, `tsc -p tsconfig.build.json`: modules under `dist/esm`, declarations under `dist/types`. |
| `bun run check` | `check:repository`, then in every package: Biome's format and lint, then `tsc --noEmit`. |
| `bun run check:fix` | Biome's formatting and safe fixes applied at the root and in every package, then the type check. |
| `bun run check:repository` | The gates that read the whole repository: Biome and `tsc --noEmit` over `scripts/`, `check:leakage`, `check:commits`. |
| `bun run test` | In every package, `vitest run` on the Bun runtime. |
| `bun run test:coverage` | The same under v8 coverage, with a floor of 100% on statements, branches, functions and lines. |
| `bun run ci` | `check:repository`, then each package's `ci` target, which is made of its `build`, `check` and `test:coverage`. The one command the pipeline runs; run it before opening a pull request. |

The pipeline is `.github/workflows/ci.yml`. Its gate job installs with the lockfile frozen and runs `bun run ci`, so what the pipeline enforces is decided in the manifests and not in the workflow. A second job runs `gitleaks` over the whole commit history, which is why its checkout is complete.

`check:leakage` refuses any file a commit from this tree would contain that holds a home path, a local account or machine name, a personal e-mail address, a tracker or decision-record identifier, a session code, a path into a planning repository, or a word that places this code in relation to other code or marks it as unfinished; any markdown paragraph broken across lines; and any root entry, hidden directory or capitalised document the gate does not declare. Adding a root entry means declaring it in `scripts/check-leakage.ts` in the same commit. Before it scans, the gate runs every rule against an input built to break it, and fails if a rule stays silent.

`check:commits` reads the subject of every commit reachable from `HEAD` and refuses one that is not a Conventional Commit with a known scope, runs past 72 characters, or does not open with a verb in the third person.

## Conventions

- Licence MIT, author `advl`, declared in every manifest and carried in `LICENSE`.
- TypeScript is strict and resolves modules as `NodeNext`: a relative import names its file with a `.js` extension. Every `tsconfig.json` extends `@canonical/typescript-config` and every `biome.json` extends `@canonical/biome-config`; neither is copied in or replaced.
- Each package has its own `biome.json`, and the root's scripts have theirs in `scripts/`. There is none at the root, because Biome allows one root configuration per tree.
- The toolchain is pinned to exact versions. A range would let the installed tools drift, and a gate whose verdict depends on the day of the install is a different gate on every machine.
- Commit subjects are Conventional Commits with a required scope: a package's short name (`lago-react`, `lago-config`, `tui`, `lago`), or `monorepo`, `deps` or `ci` for what belongs to no package. The subject is a verb phrase in the third person, under 72 characters.
- Pull request titles follow the same rule, and `.github/workflows/pr-lint.yml` enforces it: merges are squash-only and take the title as the commit on `main`. `.github/PULL_REQUEST_TEMPLATE.md` is the body's shape.
- Branches are `<type>/<slug>`, the type that of the commit the merge lands.
- Nothing in this repository points outward, and nothing in it names a person or a machine. Where a decision has a reason worth keeping, the reason is written where it applies.
- Committed text describes this code as what it is: never in relation to other code it stands in for, and never as unfinished.
- Markdown and commit bodies use one paragraph per line and are never hard-wrapped. Comments are code and wrap at the formatter's width.
- A comment says why, in words a stranger can follow. Code that reads as what it does carries none.
- Tests sit beside their source as `<name>.test.ts`, with a `describe` named for the export and `it` throughout. An `it` names what a caller can observe.
- Coverage is a floor, not a target. Behaviour lands with the tests that pin it, and the fill comes after.

## Boundaries

- `lerna.json` holds the one version every package shares.
- The packages are published under `@aztlan`. A dependency between two of them points one way; never add one that closes a circle.

## Gotchas

- Nx before 23 cannot read the lockfile Bun 1.4 writes.
- A package that imports another resolves it through the other's `dist`, so `check` and the tests build a package's dependencies first.
- Vitest's executable asks for Node. `bunx --bun` runs it on Bun, which is the runtime the packages are written for.
