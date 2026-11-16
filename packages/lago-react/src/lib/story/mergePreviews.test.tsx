import { describe, expect, it } from "vitest";
import listStories from "./listStories.js";
import mergePreviews from "./mergePreviews.js";
import runStory from "./runStory.js";
import type { Decorator } from "./types.js";

/** Draws `label` above the story. */
const labelled =
  (label: string): Decorator =>
  (Story) => (
    <box flexDirection="column">
      <text>{label}</text>
      <Story />
    </box>
  );

const scheme = { values: ["light", "dark"], default: "light" };

describe("mergePreviews", () => {
  it("sets a later layer's decorators around an earlier one's, and lets its args and parameters win", async () => {
    const preview = mergePreviews([
      {
        where: "the plugin outline",
        preview: {
          args: { text: "plugin", size: 1 },
          parameters: { grid: { on: true, step: 2 } },
          decorators: [labelled("plugin")],
          tags: ["outlined", "!dev"],
        },
      },
      {
        where: "the preview /p/lago.preview.tsx",
        preview: {
          args: { text: "project" },
          parameters: { grid: { step: 4 } },
          decorators: [labelled("project")],
          tags: ["dev"],
        },
      },
    ]);
    expect(preview).toMatchObject({
      args: { text: "project", size: 1 },
      parameters: { grid: { on: true, step: 4 } },
      tags: ["outlined", "!dev", "dev"],
    });
    const [story] = listStories(
      {
        default: {
          title: "fixtures/Text",
          render: ({ text }) => <text>{String(text)}</text>,
        },
        Default: {},
      },
      "Text.stories.tsx",
      preview,
    );
    if (!story) throw new Error("the file gave no story");
    expect((await runStory(story, { cols: 10, rows: 3 })).lines).toEqual([
      "project",
      "plugin",
      "project",
    ]);
    expect(story.tags).toEqual(["test", "outlined", "dev"]);
  });

  it("runs every layer's loaders in order and takes every layer's globals", async () => {
    const order: string[] = [];
    const preview = mergePreviews([
      {
        where: "the plugin a",
        preview: {
          globalTypes: { scheme },
          loaders: [() => void order.push("a")],
        },
      },
      {
        where: "the plugin b",
        preview: {
          globalTypes: { density: { values: ["roomy"], default: "roomy" } },
          loaders: [() => void order.push("b")],
        },
      },
    ]);
    expect(Object.keys(preview.globalTypes ?? {})).toEqual([
      "scheme",
      "density",
    ]);
    for (const loader of preview.loaders ?? []) {
      await loader({
        title: "",
        name: "",
        args: {},
        parameters: {},
        viewport: { cols: 1, rows: 1 },
        globals: {},
      });
    }
    expect(order).toEqual(["a", "b"]);
  });

  it("refuses a global two layers declare, naming both", () => {
    expect(() =>
      mergePreviews([
        { where: "the plugin palettes", preview: { globalTypes: { scheme } } },
        { where: "the plugin outline", preview: {} },
        {
          where: "the preview /p/lago.preview.tsx",
          preview: { globalTypes: { scheme } },
        },
      ]),
    ).toThrow(
      "The global scheme is declared by both the plugin palettes and the preview /p/lago.preview.tsx. A global is declared once: leave it to one of them.",
    );
  });

  it("gives an empty preview for no layers", () => {
    expect(mergePreviews([])).toEqual({
      args: {},
      parameters: {},
      decorators: [],
      loaders: [],
      tags: [],
      globalTypes: {},
    });
  });
});
