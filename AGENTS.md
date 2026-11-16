# AGENTS.md

Instructions for whoever works on this repository. Everything here is true at the commit that carries it.

## Commands

`bun run` is the task face: every gate is a script in a `package.json`.

| Command | What it does |
|---|---|
| `bun install` | Installs the toolchain. The lockfile is `bun.lock`; the pipeline installs with `--frozen-lockfile`. |
| `bun run build` | In every package, `tsc -p tsconfig.build.json`: modules under `dist/esm`, declarations under `dist/types`. |
| `bun run check` | `check:repository`, then in every package: Biome's format and lint, then `tsc --noEmit`, then `webarchitect` holding the manifest and the configuration to its `library` rules. |
| `bun run check:fix` | Biome's formatting and safe fixes applied at the root and in every package, then the type check. |
| `bun run check:repository` | The gates that read the whole repository: Biome and `tsc --noEmit` over `scripts/`, `check:leakage`, `check:commits`, `check:workspace`, `check:structure`, `check:audit`, `check:licences`. |
| `bun run test` | In every package, `vitest run` on the Bun runtime. |
| `bun run test:coverage` | The same under v8 coverage, with a floor of 100% on statements, branches, functions and lines. |
| `bun run ci` | `check:repository`, then each package's `ci` target, which is made of its `build`, `check` and `test:coverage`. The one command the pipeline runs; run it before opening a pull request. |

The pipeline is `.github/workflows/ci.yml`. Its gate job installs with the lockfile frozen and runs `bun run ci`, so what the pipeline enforces is decided in the manifests and not in the workflow. A second job runs `gitleaks` over the whole commit history, which is why its checkout is complete.

`check:leakage` refuses any file a commit from this tree would contain that holds a home path, a local account or machine name, a personal e-mail address, a tracker or decision-record identifier, a session code, a path into a planning repository, or a word that places this code in relation to other code or marks it as unfinished; any markdown paragraph broken across lines; and any root entry, hidden directory or capitalised document the gate does not declare. Adding a root entry means declaring it in `scripts/check-leakage.ts` in the same commit. Before it scans, the gate runs every rule against an input built to break it, and fails if a rule stays silent.

`check:commits` reads the subject of every commit reachable from `HEAD`, merges aside, and refuses one that is not a Conventional Commit with a known scope, runs past 72 characters, or does not open with a verb in the third person.

`check:workspace` holds every package to the workspace's shape: the scripts the root runs, a `ci` target made of them, the shared version, the `@aztlan/` name and the licence. `check:structure` holds every file under a package's `src/` to the structure stated under Conventions. Each first proves it can fail.

`check:audit` refuses a dependency with a published advisory, and needs the network. `check:licences` refuses a dependency that ships with a package under a licence that is not permissive; development tools never ship, so theirs bind nothing.

## Conventions

- Licence MIT, author `advl`, declared in every manifest and carried in `LICENSE`.
- TypeScript is strict and resolves modules as `NodeNext`: a relative import names its file with a `.js` extension. Every `tsconfig.json` extends `@canonical/typescript-config` and every `biome.json` extends `@canonical/biome-config`; neither is copied in or replaced.
- Each package has its own `biome.json`, and the root's scripts have theirs in `scripts/`. There is none at the root, because Biome allows one root configuration per tree.
- The toolchain is pinned to exact versions. A range would let the installed tools drift, and a gate whose verdict depends on the day of the install is a different gate on every machine.
- Commit subjects are Conventional Commits with a required scope: a package's short name (`lago-core`, `lago-react`, `lago-config`, `tui`, `lago`), or `monorepo`, `deps` or `ci` for what belongs to no package. The subject is a verb phrase in the third person, under 72 characters.
- Pull request titles follow the same rule, and `.github/workflows/pr-lint.yml` enforces it: merges are squash-only and take the title as the commit on `main`. `.github/PULL_REQUEST_TEMPLATE.md` is the body's shape.
- Branches are `<type>/<slug>`, the type that of the commit the merge lands.
- Nothing in this repository points outward, and nothing in it names a person or a machine. Where a decision has a reason worth keeping, the reason is written where it applies.
- Committed text describes this code as what it is: never in relation to other code it stands in for, and never as unfinished.
- Markdown and commit bodies use one paragraph per line and are never hard-wrapped. Comments are code and wrap at the formatter's width.
- A comment says why, in words a stranger can follow. Code that reads as what it does carries none.
- Tests sit beside their source as `<name>.test.ts`, with a `describe` named for the export and `it` throughout. An `it` names what a caller can observe.
- Fixtures that a package's tests share live in `testing/` at the package's root, outside what is built. A test that runs more than one domain together, such as vitest in a scratch project, lives under `src/testing/integration/`.
- Tests run the renderer for real. Only the network, the file system outside a temporary folder, and timers are stood in for.
- Coverage is a floor, not a target. Behaviour lands with the tests that pin it, and the fill comes after.
- A package with components extends `@canonical/typescript-config-react` and takes its JSX runtime from `@opentui/react`, in `tsconfig.json` and in `vitest.config.ts`.
- A stories file follows Component Story Format 3: the component imported as `Component`, `const meta = { … } satisfies Meta<typeof Component>`, and one named export per state with a documentation comment above it.
- A story's picture is kept beside its stories file as `__goldens__/<file>.<Story>.<viewport>.golden`. A run on a person's machine writes a golden that is missing, and a pipeline fails for it; `-u` rewrites every golden and removes those no story owns. A changed golden is reviewed in the diff like code.
- An implementation file exports one value, as its default, at its declaration, and is named after it. `types.ts` exports only types and `constants.ts` only named constants.
- A folder's `index.ts` is a barrel of named re-exports reaching a file beside it or a child folder's `index.js`. No `export *`, and no `#` alias.
- In a library, each domain is a folder under `src/lib/`. The gallery is an application, organised by what it does: each domain is a folder directly under `src/`. Code inside a domain imports its siblings by file; code in another domain imports through the barrel.
- Every function name starts with a verb. A function that is not pure says so with `@note` and the reason. Indexed access uses `.at()`.

## Boundaries

- `lerna.json` holds the one version every package shares.
- The packages are published under `@aztlan`. A dependency between two of them points one way; never add one that closes a circle.
- What a package publishes is its manifest's `exports` map and nothing beside it.
- `@aztlan/lago-core` names no renderer: it imports neither React nor `@opentui/*`, and no other Lago package. `@aztlan/lago-react` depends on it, and `@aztlan/lago-config` on `@aztlan/lago-react`; each is built after what it depends on.
- `@aztlan/tui` takes the renderer, its keymap and React as peers: one copy of each must serve the application and the components, or a provider made by one is not seen by the other. It is tested by Lago, so `lago-react` and `lago-config` are among its development dependencies and never among its dependencies.

## Gotchas

- Nx before 23 cannot read the lockfile Bun 1.4 writes.
- A package that imports another resolves it through the other's `dist`, so `check` and the tests build a package's dependencies first.
- Vitest's executable asks for Node. `bunx --bun` runs it on Bun, which is the runtime the packages are written for.
- `webarchitect`'s `library` rules assume a `@canonical/` name and the LGPL-3.0 licence. Both are overridden by flag, not by a local copy of the rules.
- Vitest must load the renderer's Bun build, which `ssr.resolve.conditions` in `vitest.config.ts` asks for. With two builds loaded, an object made by one is not recognised by the other.
- The renderer's own declarations do not type-check, against themselves or against React's. `skipLibCheck` skips declaration files only.
- The renderer's own `flush` waits on a timer, so it never returns while timers are faked. A screen settles by asking the scheduler's state and drawing on demand.
- React's `act` waits on `setImmediate`. A test fakes the timers a component uses, the clock and the high-resolution clock among them, and leaves that one real, which `fakeTimers.toFake` in `vitest.config.ts` sets for every test.
- React warns about an update outside `act` whenever `IS_REACT_ACT_ENVIRONMENT` is set, as when a timer a test moved sets state, so it is set for the length of `act` alone.
- Ctrl+C closes a renderer unless it is made with `exitOnCtrlC: false`.
- In the renderer's default key mode a lone Escape waits on a timer and joins the next key, and most modifiers are lost. A renderer made with `kittyKeyboard: true` sends every key at once, with its modifiers.
- The renderer wraps every tree in a boundary that draws a caught error's stack as text. `render` mounts the component inside a boundary of its own, so a test fails with the error instead of drawing it.
- Text given no colour is drawn in fixed white, not in the terminal's own colour.
- The renderer reports an inverted cell with its two colours already exchanged, and the attribute kept.
- Vitest keeps transformed modules between runs, keyed by their source. A plugin whose output depends on its options adds them to the key with `defineCacheKeyGenerator`, or a changed option is never seen.
- In watch mode, an update of every snapshot reaches the tests and not the plugins, so whether a run updates is read in the test, from `expect.getState().snapshotState`.
- Coverage counts every project in a run. `lago-react` counts its stories project on purpose, because those stories test the plugin; a project configured by `createConfig` measures its unit project alone.
- A test that runs vitest in a scratch project gives it only `PATH`, `HOME`, `TMPDIR` and `LANG`, so no pipeline variable makes it a pipeline run, a `package.json` of type `module`, and a module cache inside the project.
- A package configured by `createConfig` runs `vitest run --coverage --project unit`, then its stories with `vitest run --project stories`, as its `test:coverage`: a coverage run that includes the stories is refused.
- Text is measured by asking the renderer's own text buffer, in both of its width methods, and taking the wider, so a line fitted to its width never runs past it in either kind of terminal. Bun's own measure counts some text narrower than the renderer draws it.
- A value with a `then` property is taken for a promise by `await`, so no object a caller passes, such as a fitting rule, has one.
- The gallery starts the project's own vitest from code, with `update: "none"`: a run never writes a golden, so a missing one is reported as new, and only accepting it in the gallery writes it.
- Vitest's own `start` refuses a project with no test file, so the gallery asks `globTestSpecifications` first and opens an empty gallery on a project with no stories yet.
- Vitest started from code prints to the terminal the gallery draws on unless it is given streams of its own, so the gallery gives it streams that keep nothing.
- Vitest tells a reporter of a removed test file with `onTestRemoved` and runs nothing after, so the gallery's reporter drops that file's stories there.
- A screenshot keeps no blank cell before a run's first drawn character, so a fixture's run starts where its text does.
- A box's border shows its title only when the title fits between the corners, so a frame is made wide enough for its story's name.
- Biome takes a function named `fit` for a focused test.
- A command's `enabled` is read from the screen last drawn, so a key acts on what the reader sees. `userEvent` settles the screen after each key; a test that drives a renderer by hand draws it again between keys.
- The test keyboard sends a capital letter as a key of its own, where a terminal sends the letter with shift. A binding is written `shift+a`, and a test presses `{Shift>}a{/Shift}`.
- Two commands may share a key while only one is enabled: Enter opens, or keeps what is typed.
- The key bar names each hint by its words, so no two commands enabled at once share a description: Esc says "put the cursor away" where `c` says "stop reading cells".
- Text typed into the filter or the search comes through `useKeyboard`, while every binding but Enter, Esc and Backspace is off. The reducer ignores typing when nothing is being typed, so the handler sends every printable key.
- A package linked from a checkout imports the checkout's own React and renderer, and a second React has no component to call hooks from. `createConfig` has vitest read the `@aztlan` packages and resolve React and the renderer to the project's one copy.
- `scripts/check-packages.ts` lists every name each entry exports. A change to what a package publishes changes that list in the same commit.
