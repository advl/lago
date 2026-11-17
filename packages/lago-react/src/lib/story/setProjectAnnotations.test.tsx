import { afterEach, describe, expect, it } from "vitest";
import * as stories from "../../../testing/Counter.stories.js";
import { render } from "../render/index.js";
import composeStories from "./composeStories.js";
import setProjectAnnotations from "./setProjectAnnotations.js";
import type { Decorator } from "./types.js";

/** Draws a line above the story, naming its title. */
const titled: Decorator = (Story, { title }) => (
  <box flexDirection="column">
    <text>{title}</text>
    <Story />
  </box>
);

describe("setProjectAnnotations", () => {
  afterEach(() => {
    setProjectAnnotations({});
  });

  it("sets every story composed after it inside the preview, its decorators outermost", async () => {
    setProjectAnnotations({
      args: { start: 5 },
      decorators: [titled],
      tags: ["themed"],
    });
    const { Default, Ruled } = composeStories(stories);
    expect((await Default.run({ cols: 20, rows: 2 })).lines).toEqual([
      "fixtures/Counter",
      "apples 5",
    ]);
    expect((await Ruled.run({ cols: 16, rows: 3 })).lines).toEqual([
      "fixtures/Counter",
      "────────────────",
      "apples 5",
    ]);
    expect(Default.tags).toEqual(["dev", "test", "themed"]);
  });

  it("gives a composed story each global's default, or the value the story fixes", async () => {
    setProjectAnnotations({
      globalTypes: { scheme: { values: ["light", "dark"], default: "dark" } },
      decorators: [
        (Story, { globals }) => (
          <box flexDirection="column">
            <text>{`scheme ${globals.scheme}`}</text>
            <Story />
          </box>
        ),
      ],
    });
    const { Default } = composeStories(stories);
    expect((await Default.run({ cols: 20, rows: 2 })).lines).toEqual([
      "scheme dark",
      "apples 0",
    ]);
    await Default.load();
    expect((await render(<Default />, { cols: 20, rows: 2 })).lines).toEqual([
      "scheme dark",
      "apples 0",
    ]);
  });

  it("refuses a preview whose globalTypes cannot be drawn with", () => {
    expect(() =>
      setProjectAnnotations({
        globalTypes: { scheme: { values: [], default: "dark" } },
      }),
    ).toThrow(
      "The preview given to setProjectAnnotations declares the global scheme with no values to take.",
    );
  });

  it("sets a story inside a list of previews, a plugin's before the project's, as its stories file is", async () => {
    setProjectAnnotations([
      { decorators: [titled], args: { start: 1 } },
      {
        args: { start: 2 },
        decorators: [
          (Story) => (
            <box flexDirection="column">
              <text>project</text>
              <Story />
            </box>
          ),
        ],
      },
    ]);
    const { Default } = composeStories(stories);
    expect((await Default.run({ cols: 20, rows: 3 })).lines).toEqual([
      "project",
      "fixtures/Counter",
      "apples 2",
    ]);
  });

  it("refuses a list of previews in which two declare one global, naming both", () => {
    const scheme = { values: ["light", "dark"], default: "dark" };
    expect(() =>
      setProjectAnnotations([
        { globalTypes: { scheme } },
        { globalTypes: { scheme } },
      ]),
    ).toThrow(
      "The global scheme is declared by both the preview 1 of the 2 given to setProjectAnnotations and the preview 2 of the 2 given to setProjectAnnotations.",
    );
    expect(() =>
      setProjectAnnotations([
        {},
        { globalTypes: { scheme: { values: [], default: "x" } } },
      ]),
    ).toThrow(
      "The preview 2 of the 2 given to setProjectAnnotations declares the global scheme with no values to take.",
    );
  });

  it("leaves a story composed before it as it was composed", async () => {
    const { Default } = composeStories(stories);
    setProjectAnnotations({ decorators: [titled] });
    expect((await Default.run({ cols: 20, rows: 1 })).lines).toEqual([
      "apples 0",
    ]);
  });

  it("mounts a story as a component under a preview with loaders once it is loaded", async () => {
    setProjectAnnotations({
      loaders: [() => ({ owner: "ada" })],
      decorators: [
        (Story, { loaded }) => (
          <box flexDirection="column">
            <text>{`for ${String(loaded.owner)}`}</text>
            <Story />
          </box>
        ),
      ],
    });
    const { Default } = composeStories(stories);
    await Default.load();
    expect((await render(<Default />, { cols: 20, rows: 2 })).lines).toEqual([
      "for ada",
      "apples 0",
    ]);
  });
});
