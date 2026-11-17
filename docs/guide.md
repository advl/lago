# Writing and reviewing stories with Lago

Lago makes a terminal interface drawn by OpenTUI reviewable the way a web interface is with Storybook: each state a component can be in is a story; every story is drawn on every test run and compared with a golden kept beside it; and `lago` shows the pictures in a terminal, where a changed one is read and accepted.

## The five packages

| Package | What it gives | What it stands for in Storybook |
|---|---|---|
| `@aztlan/lago-core` | the screen, the screenshot and the golden, which name no renderer; installed with `@aztlan/lago-react`, which re-exports the types a test names | none |
| `@aztlan/lago-react` | the story types (`Meta`, `StoryObj`, `Preview`), `render`, `composeStories`, `setProjectAnnotations` and `waitFor` for tests; the vitest plugin `testStories` from `@aztlan/lago-react/vitest` | `@storybook/react` and its vitest add-on |
| `@aztlan/lago-config` | `createConfig`, the vitest configuration a project needs | the project's own Storybook and vitest configuration |
| `@aztlan/tui` | the components both an application and the gallery draw: the pane, its header, the scrolled list, the key bar and the help, notices, loading lines and empty states; the keymap and the text-fitting functions; the tokens they draw with, and `TokensProvider` to draw them in other colours | none |
| `@aztlan/lago` | the `lago` binary, the gallery | `storybook` |

## Requirements

- Bun 1.4 or later. The packages are written for Bun and its build of the renderer.
- vitest 5.
- OpenTUI 0.8 (`@opentui/core`, `@opentui/react`, and `@opentui/keymap` for the components) and React 19.2 or later, installed by the project: one copy of each serves the application, its components and its stories.

## Setting a project up

Install the three packages a project uses, as development dependencies, beside the peers it already has:

```sh
bun add -d @aztlan/lago-react @aztlan/lago-config @aztlan/lago
```

Replace the project's vitest configuration with one call:

```ts
// vitest.config.ts
import { createConfig } from "@aztlan/lago-config";

export default createConfig({
  viewports: {
    narrow: { cols: 40, rows: 12 },
    wide: { cols: 100, rows: 30 },
  },
  coverage: true,
});
```

`createConfig` compiles JSX against `@opentui/react`, loads the renderer's Bun build, fakes the timers a component uses while leaving React's own real, and makes two vitest projects: `unit` over `src/**/*.test.{ts,tsx}` and `stories` over `src/**/*.stories.tsx`, which the plugin draws at each viewport. With `coverage`, the unit project is measured at 100%; the stories are pictures, not coverage. A project with more to say merges its own settings over the result with vitest's `mergeConfig`.

The project's scripts:

```json
{
  "test": "vitest run --project unit",
  "test:stories": "vitest run --project stories",
  "test:coverage": "vitest run --coverage --project unit && vitest run --project stories"
}
```

## Writing a story

A stories file is Component Story Format 3: the component, a `meta` with the args every story shares, and one named export per state, each with a sentence above it that says what to look for.

```tsx
// src/Notice/Notice.stories.tsx
import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./Notice.js";

const meta = {
  title: "component/Notice",
  component: Component,
  args: { reason: "git is not installed", recovery: "install git" },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A reason and its recovery, each on its own line. */
export const Missing: Story = {};

/** A recovery longer than the pane: it wraps, and the command it names stays whole. */
export const Long: Story = {
  args: { recovery: "run `git config --global user.email you@example.com` in the project" },
};
```

- `render` receives the viewport the story is drawn at, so a component that takes its width is drawn at the screen's.
- A story drawn otherwise says so in `parameters.viewports`: an entry under one of the project's names changes that viewport, so `{ narrow: { rows: 12 } }` draws it on 12 lines, and an entry under a new name adds one, with both its size and its lines.
- A state reached by keys is a story with `play`, which presses them: `play: async ({ userEvent }) => { await userEvent.keyboard("{ArrowDown}{Enter}"); }`.
- A provider is a decorator: `decorators: [(Story) => <Keys>{Story()}</Keys>]`.
- Data a story needs before it is drawn comes from a loader: `loaders: [async () => ({ user: await readUser() })]`. Loaders run one after another, the file's before the story's, each once the one before it has finished, on the stopped clock, where no timer fires: a loader awaits promises, never a delay, or its story's test ends still waiting for it and says so. What they give is merged into `loaded`, which `render`, the decorators and `play` read from their context, a later loader's value winning under the same name.
- `tags: ["!test"]` leaves a story out of the test run, and keeps its goldens.

## A project's preview

What every story of a project shares is written once, in a preview module whose default export holds it:

```tsx
// src/lago.preview.tsx
import type { Preview } from "@aztlan/lago-react";
import { Keys } from "@aztlan/tui";

const preview = {
  decorators: [(Story) => <Keys>{Story()}</Keys>],
} satisfies Preview;

export default preview;
```

`createConfig({ preview: "./src/lago.preview.tsx" })` names the module from the project's root, and every stories file is then set inside it; coverage leaves it out, as it leaves the stories. A project that writes its own configuration gives the same path to the plugin, as `testStories({ viewports, preview })`. A preview holds `args`, `parameters`, `decorators`, `loaders`, `tags` and `globalTypes`, and each is set around what the file and the story say:

- its args and parameters come first, so a file's or a story's win;
- its decorators wrap all the others, the file's included;
- its loaders run before the file's, and its tags are read before the file's.

## Globals and modes

A setting that is not an arg, such as a colour scheme, a density or a set of glyphs, is a global. The preview declares each one with the values it takes and its default:

```tsx
// src/lago.preview.tsx
import type { Preview } from "@aztlan/lago-react";
import { SeatProvider, SCHEMES } from "./seat.js";

const preview = {
  globalTypes: {
    scheme: { values: ["classic", "tokyo-night", "dracula", "iceberg"], default: "classic" },
    tint: { values: ["16", "truecolor"], default: "16" },
  },
  decorators: [
    (Story, { globals }) => (
      <SeatProvider palette={SCHEMES[globals.scheme]} tint={globals.tint}>
        {Story()}
      </SeatProvider>
    ),
  ],
} satisfies Preview;

export default preview;
```

- `globals` in a story's context holds the value of every declared global, for `render`, the decorators, the loaders and `play`.
- A story, or its file's default export, fixes a global with `globals: { scheme: "dracula" }`; the story's win over the file's.
- A global the preview does not declare, or a value it does not take, fails the stories file, naming the file, the story and the declared choices.

A mode is a named set of globals every story is also drawn in. The configuration names the modes beside the viewports:

```ts
// vitest.config.ts
import { createConfig } from "@aztlan/lago-config";

export default createConfig({
  viewports,
  preview: "./src/lago.preview.tsx",
  modes: {
    dracula: { globals: { scheme: "dracula" }, expect: { tags: ["coloured"] } },
    truecolor: { globals: { tint: "truecolor" } },
  },
  matrix: { max: 400 },
});
```

A project that writes its own configuration gives the same to the plugin, as `testStories({ viewports, preview, modes, matrix })`.

- A mode's name becomes part of a golden's file name, so it holds letters, digits, `-` and `_`. A mode sets at least one global, and only globals the preview declares, at their values.
- Every story is drawn at every viewport in the base, which sets nothing, and then in each mode. A value resolves as the story's own, then the mode's, then the default.
- A mode's test is named `<Story> at <viewport>@<mode>`, after the base's `<Story> at <viewport>`.
- A mode's picture is compared with the base picture at the same viewport, drawn in the same run. Equal, it keeps no golden. Different, it is compared with its own golden, `<file>.<Story>.<viewport>@<mode>.golden`, written on a person's machine and missing in a pipeline like any other.
- A mode names the stories it is meant to change with `expect.tags`, a list of tags. Such a story whose picture comes out equal to the base's fails, naming the mode: the mode's globals did not reach it, or the story fixes them itself.
- A story leaves a mode out with `parameters.modes: { dracula: { disable: true } }`.

After the stories run, the run prints the matrix totals, a line for the whole and one per mode:

```
Matrix: 450 pictures covered, 50 in the base and 400 in 8 modes: 14 distinct · 386 equal · 0 expected but equal · 0 excluded
  dracula            2 distinct · 48 equal · 0 expected but equal · 0 excluded
```

- **covered**: every picture drawn, the base's and the modes';
- **distinct**: a mode's pictures that differ from the base's, each kept as a golden;
- **equal**: a mode's pictures equal to the base's, which keep none;
- **expected but equal**: equal pictures of stories the mode expects to change, each a failed test;
- **excluded**: cells a story leaves out with `parameters.modes`.

A run with no modes prints nothing of the kind. What equality saves is files and review, not time: each mode draws every story once more. `matrix: { max: 400 }` bounds that cost. It counts the matrix's cells from the stories files as they are written: every story they export, at every configured viewport, in the base and in each mode, the stories and modes a story leaves out included and the viewports a story adds not. A project with more cells is refused before anything is drawn, with its count.

## Goldens

The first run of a story on a person's machine writes its picture beside the stories file, as `__goldens__/<file>.<Story>.<viewport>.golden`: the screen's text, then each run's colours and attributes. A mode's picture that differs from the base's is kept beside it as `<file>.<Story>.<viewport>@<mode>.golden`, so the two sort together. Every later run compares the picture with it. In a pipeline, a missing golden fails the run, so a story without one never passes unseen.

A golden is text, and a changed one is read in the pull request's diff like code. Accepting a new picture is deliberate: `A` on that picture in the gallery, or `vitest run --project stories -u` on a named file. `-u` also removes the goldens no story owns, a mode's whose picture has come to equal the base's among them.

## Testing a component

`render` mounts a component on a test renderer and gives its screen. Keys go through `userEvent`, and the screen settles after each.

```tsx
import { composeStories, render } from "@aztlan/lago-react";
import { expect, it } from "vitest";
import * as stories from "./Notice.stories.js";

const { Missing } = composeStories(stories);

it("opens the recovery with its label", async () => {
  const screen = await render(<Missing />, { cols: 40, rows: 4 });
  expect(screen.lines.at(1)).toBe("Recovery: install git");
  expect(screen.getByText("✗").fg).toBe(1);
});
```

`composeStories` gives each story as a component with its args and decorators, so a test starts from the state the story shows. A story with loaders is mounted once `await Story.load()` has run them, on the test's own clock, and is refused before; its `run()` runs them itself, on the stopped clock. `waitFor` retries an assertion until it passes or times out, for what arrives after a timer or a promise.

A test draws a story inside the project's preview once it hands `composeStories` the same preview with `setProjectAnnotations`, at the top of the test file, before it composes:

```ts
import { composeStories, setProjectAnnotations } from "@aztlan/lago-react";
import preview from "../lago.preview.js";
import * as stories from "./Notice.stories.js";

setProjectAnnotations(preview);

const { Missing } = composeStories(stories);
```

It is called in the test files that compose stories, not in a setup file: a setup file would load the preview, and every module it imports, into every test file, ahead of that file's own mocks. A preview with loaders gives every story loaders, so such a test awaits `load()` before it mounts a story as a component.

## The gallery

`lago` in a project's folder, or `lago <folder>`, opens the gallery. It runs the project's own vitest on the stories project, never writing, and draws a stories file again when it is saved. It reads every story at each viewport in the base and in each mode the configuration names. It opens on the base pictures, and the counts take in every mode's pictures with them.

| Key | What it does |
|---|---|
| `↑` `↓` or `k` `j` | choose a component or a story; scroll an inspected picture |
| `←` `→` or `h` `l` | choose a story beside another; move the cursor over cells |
| `Enter` | open a component's stories; inspect a story |
| `Esc` | come out one step |
| `/` | filter the components, or search the stories' names, descriptions and drawn text |
| `n` `N` | the next and the previous match |
| `p` | the next viewport |
| `m` | the next mode, the base first and then the configuration's in its order; only in a project with modes |
| `x` | open or close the matrix; only in a project with modes |
| `v` | set the stories as the room allows, in rows, or side by side |
| `d` | show the golden over a changed picture, the difference in words |
| `c` | read the cell under a cursor: its text, both colours as asked, its attributes |
| `A`, then `y` | accept the picture as its golden |
| `?` | every key |
| `q` | quit |

In a project with modes, the status line names the size and the mode shown after what it says, as `narrow · dark`, and each frame and inspected picture is titled with its state in that mode:

- a picture of its own, kept as `<file>.<Story>.<viewport>@<mode>.golden`, is passing, changed or new like any other, and `A` accepts it as that mode's golden;
- `=` is a picture equal to the base picture at the same size, which keeps no golden: it shows the base picture and says so, and `A` says there is nothing to accept;
- `!` is a picture equal to the base where the mode expects a change, a failure shown by its message, which says whether the mode's globals did not reach the story or the story fixes them itself;
- a story that leaves the mode out with `parameters.modes` says so in its frame.

The matrix, on `x`, has one row for each story and one column for each viewport in the base and then in each mode, the viewport's name over its columns and each mode's under it:

```
                terminal          wide
story           base  dark  ascii base  dark  ascii
▸ Badge Default [✓]    ✓     =     ✓     ✓     =
  Badge Loud     ✓     ±     +     ✓     ±     +
  Badge Quiet    ✓     !           ✓     !
```

A cell is ✓ passing, ± changed, + new, `=` equal to the base, `!` equal where the mode expected a change, ✗ an error, and blank where the story is not covered, as when its file leaves the mode out; a legend under the matrix says as much. The arrows choose a cell, which the status line names with its state. Enter opens it, on its difference when it changed, and Esc comes back to the matrix. A matrix larger than the terminal scrolls both ways to keep the chosen cell in view, its title says which stories and columns are shown, and a mode's name longer than its column is cut. A filter kept on the tree leaves the matrix only the stories of the components it matches, and the title names it; a search kept on the stories is set aside while the matrix is open, so the status line names the chosen cell.

Help lists, under `m`, the base, each mode with the globals it sets, and each global with the values the stories were drawn at. A project with no modes has no `m` and no `x`, and its status line names no size or mode.

A story that throws shows every error its test failed with, each with its place in the source, and a timeout after the error that says why, such as loaders that never finish on the stopped clock; no other story is affected. A stories file that fails to load is named in the status line.

### The gallery's chrome

The gallery's own look, its chrome, is set by the project, in its configuration, and by nothing else: there is no setting of a person's own.

```ts
createConfig({ viewports, gallery: { chrome: "terminal" } });
```

| Chrome | What it looks like |
|---|---|
| `terminal`, the default | the terminal's own text and background, transparency included, and its palette's red, green, yellow, white and bright black for the marks |
| `light`, `dark` | every colour fixed, and the background painted across the whole gallery, so it looks the same in any terminal |
| a set of tokens | `{ ...tokens, "color.text": RGBA.fromHex("#202020") }`: every token of `@aztlan/tui`'s `tokens`, in colours of the project's choosing |

`terminal` is the chrome to choose. It already follows each reader's terminal, whatever its colours, so the gallery looks right to everyone without a setting of their own. Each colour is paired with a glyph or a word in every chrome, so a status reads the same in all of them.

The chrome colours the gallery around the pictures and never a picture itself: a story is drawn, and its golden kept, in the colours it asks for, whatever the chrome. The gallery refuses a chrome it cannot read when it opens, naming the configuration's file: a name it has no chrome for, or a set of tokens that lacks one.

## Practices

1. One story per state worth pinning, named for the state, with one sentence above it that says what to look for.
2. Every component has a story whose text is longer than it holds.
3. Viewports are project data: the narrowest terminal the application supports, and one wider.
4. Time, randomness and data come in as args. The clock stands at zero.
5. Colours are palette entries or the terminal's defaults, through tokens. A component reads them with `useTokens`, as it draws, so a `TokensProvider` above it changes them; outside any provider they are `tokens`, the terminal's own. Text given no colour is drawn fixed white.
6. Providers are decorators. Those every story needs are written once, in the project's preview.
7. Keys go in `play`. A callback is asserted with `expect(args.onChoose)`.
8. Stories run in their own vitest project, so that pictures are not counted as coverage. `createConfig` sets this up.
9. A changed golden is read in the pull request's diff first and in the gallery second. Accepting is deliberate: `A` on one picture, or `vitest -u` on a named file.
10. A renderer upgrade is a branch, a story run and a walk through the gallery.
11. A key is bound in the keymap and nowhere else; the key bar and the help read it from there.

## When something is wrong

- **Two copies of React or of the renderer.** A hook fails with "Invalid hook call", or an object made by one copy of the renderer is not recognised by the other. `createConfig` resolves both to the project's one copy, Lago's packages included, even when they are linked from a checkout of Lago, and loads the renderer's Bun build. A project that writes its own configuration lists React and the renderer in `resolve.dedupe`, and lets vitest read the `@aztlan` packages with `server.deps.inline`.
- **A test hangs under faked timers.** The renderer's own `flush` waits on a timer. `render` settles a screen without it; a test that draws by hand asks the scheduler's state and draws on demand.
- **React warns about `act`.** A timer a test moved set state. `render` and `userEvent` wrap their work in `act`; a test that moves timers by hand does it through them.
- **Text is white in a light terminal.** Text given no colour is drawn fixed white, not in the terminal's own colour. Give it the token for the terminal's foreground.
- **A golden differs on another machine.** A picture is the renderer's measure of the text, so the renderer's version is pinned in the project's lockfile, and an upgrade is its own change.
