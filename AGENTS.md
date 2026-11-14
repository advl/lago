# AGENTS.md

Instructions for whoever works on this repository. Everything here is true at the commit that carries it.

## Commands

`bun run` is the task face: every gate is a script in a `package.json`.

| Command | What it does |
|---|---|
| `bun install` | Installs the toolchain. The lockfile is `bun.lock`; the pipeline installs with `--frozen-lockfile`. |
| `bun run build` | In every package, `tsc -p tsconfig.build.json`: modules under `dist/esm`, declarations under `dist/types`. |
| `bun run check` | In every package, Biome's format and lint, then `tsc --noEmit`. |
| `bun run check:fix` | Biome's formatting and safe fixes applied, then the type check. |

## Conventions

- Licence MIT, author `advl`, declared in every manifest and carried in `LICENSE`.
- TypeScript is strict and resolves modules as `NodeNext`: a relative import names its file with a `.js` extension. Every `tsconfig.json` extends `@canonical/typescript-config` and every `biome.json` extends `@canonical/biome-config`; neither is copied in or replaced.
- The toolchain is pinned to exact versions. A range would let the installed tools drift, and a gate whose verdict depends on the day of the install is a different gate on every machine.

## Boundaries

- `lerna.json` holds the one version every package shares.
- The packages are published under `@aztlan`. A dependency between two of them points one way; never add one that closes a circle.

## Gotchas

- Nx before 23 cannot read the lockfile Bun 1.4 writes.
- A package that imports another resolves it through the other's `dist`, so `check` builds a package's dependencies first.
