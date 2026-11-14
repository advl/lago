---
name: adopt-lago
description: Adopt Lago in a project whose terminal interface is drawn by OpenTUI and React: stories as tests with goldens, the vitest configuration, and the lago gallery
---

# Adopt Lago

Brings a project to stories that are drawn and checked on every test run, with goldens kept beside them, and a gallery to read them in. Complete this and a change to how any component looks fails a test until someone reads the new picture and accepts it.

## When to Use

- A project draws a terminal interface with OpenTUI and React, and wants its screens reviewable and tested.
- A project already has stories, or saved screens of its own, and wants them checked by Lago instead.

## When NOT to Use

- The interface is drawn by another renderer or binding (Ink, OpenTUI's Solid binding, raw output). Lago draws React components through OpenTUI only.
- The project runs on Node without Bun, or on a vitest older than 5.

## Opening move

Unless the first message already names the project, ask for it, with an example:

> Point me at the project, its folder or repository, and say whether it already has stories or saved screens.

"I don't know" is a fine answer: the first step finds out.

## Every step is narrated

Open each step with the outcome it should leave and how you will get there; close it with what it established and what that means for the next. One sentence each. The person can only steer a step they saw coming.

## Workflow

1. **Prerequisites.** Confirm Bun 1.4 or later, vitest 5, React 19.2 or later, and OpenTUI 0.8 (`@opentui/core`, `@opentui/react`, and `@opentui/keymap` if the project binds keys). If OpenTUI is older, stop here: upgrading the renderer is its own change, made first, with the project's existing checks green before and after.
2. **Install.** `bun add -d @aztlan/lago-react @aztlan/lago-config @aztlan/lago`. While the packages are not published, link them from a checkout of Lago, built with `bun run build`: `bun link` in each package's folder there, then `bun link @aztlan/lago-react @aztlan/lago-config @aztlan/lago` in the project. `createConfig`, in the next step, makes the linked packages use the project's own React and renderer.
3. **Configure.** Replace the project's vitest configuration with `createConfig` from `@aztlan/lago-config`. Keep what the project adds of its own by merging it over the result with vitest's `mergeConfig`. Remove what `createConfig` now sets: the JSX runtime, the renderer's build condition, the faked timers, the test file globs.
4. **Viewports.** Choose them from how the application is used: the narrowest terminal it supports, and one wider. Ask the person when the project does not say.
5. **The first stories file.** Convert one the project has, or write one for a small component: the component as `Component`, `const meta = { … } satisfies Meta<typeof Component>`, one named export per state with a sentence above it. A story whose text is longer than the component holds is one of them.
6. **The first run.** `vitest run --project stories`. Read each golden it wrote beside the stories file and confirm with the person that it is the picture they expect.
7. **Prove it catches a change.** Change one colour in the component, run the stories, and watch the story fail with the difference. Undo the change and watch it pass.
8. **The pipeline.** Make the project's checks run `vitest run --coverage --project unit && vitest run --project stories`. In a pipeline a missing golden fails, so a story never passes unseen.
9. **The gallery.** Run `lago` in the project and walk the stories once with the person: `Enter` to open, `d` on a changed picture, `A` to accept.
10. **Migrate the rest.** Move the project's other stories and picture checks over, one file at a time, comparing each new golden with the saved screen it replaces:

| What the project has | What it becomes |
|---|---|
| its own story types | `Meta` and `StoryObj` from `@aztlan/lago-react` |
| a test that draws every story and compares it with saved files | the plugin, through `createConfig`; the test is deleted |
| saved screens in a folder of their own | goldens beside each stories file |
| a helper that mounts a component and reads its lines | `render` and its screen |
| a helper that waits for a condition | `waitFor` |
| a test that imports a stories file as its fixture | `composeStories` |
| calls to the renderer's mock keyboard | `screen.userEvent.keyboard` |
| a wrapper that gives a tree the keymap | `Keys` from `@aztlan/tui` |

## Verification

The adoption is done when all of these hold:

- `vitest run --project stories` passes, and every stories file has its goldens beside it.
- A deliberately broken story is caught: make a story throw, run the stories, and see it fail with the error and its place, every other story still passing; then undo it.
- A changed colour fails its story, as in step 7.
- The pipeline runs the stories project, and fails on a missing golden.
- `lago` opens on the project and shows every story.
