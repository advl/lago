import { describe, expect, it } from "vitest";
import prepareStory from "./prepareStory.js";
import type { Decorator, Meta } from "./types.js";

const Label = ({ text, loud }: { text: string; loud?: boolean }) => (
  <text>{loud ? text.toUpperCase() : text}</text>
);
const inner: Decorator = (Story) => <Story />;
const outer: Decorator = (Story) => <Story />;
const meta: Meta<typeof Label> = {
  title: "fixtures/Label",
  component: Label,
  args: { text: "from the file", loud: true },
  parameters: { rows: 4, docs: { page: "one" } },
  decorators: [outer],
  tags: ["slow"],
};

describe("prepareStory", () => {
  it("gives a story what its file's default export says, the story's own word last", () => {
    const play = () => {};
    const story = prepareStory(meta, "Quiet", {
      args: { loud: false },
      parameters: { docs: { note: "two" } },
      decorators: [inner],
      tags: ["!slow", "wide"],
      play,
    });
    expect(story).toMatchObject({
      title: "fixtures/Label",
      name: "Quiet",
      args: { text: "from the file", loud: false },
      parameters: { rows: 4, docs: { page: "one", note: "two" } },
      decorators: [inner, outer],
      tags: ["dev", "test", "wide"],
      play,
    });
  });

  it("runs the file's loaders before the story's", () => {
    const fromFile = () => ({ from: "file" });
    const fromStory = () => ({ from: "story" });
    const story = prepareStory({ ...meta, loaders: [fromFile] }, "Loaded", {
      loaders: [fromStory],
    });
    expect(story.loaders).toEqual([fromFile, fromStory]);
    expect(prepareStory(meta, "Bare", {}).loaders).toEqual([]);
  });

  it("sets a story inside the project's preview: its args, parameters, loaders and tags first, its decorators outermost", () => {
    const outermost: Decorator = (Story) => <Story />;
    const fromPreview = () => ({ from: "preview" });
    const fromFile = () => ({ from: "file" });
    const fromStory = () => ({ from: "story" });
    const story = prepareStory(
      { ...meta, loaders: [fromFile] },
      "Previewed",
      {
        parameters: { docs: { note: "two" } },
        decorators: [inner],
        loaders: [fromStory],
        tags: ["slow"],
      },
      {
        args: { text: "from the preview", width: 20 },
        parameters: { rows: 2, docs: { page: "zero", theme: "dark" } },
        decorators: [outermost],
        loaders: [fromPreview],
        tags: ["!dev", "themed", "!slow"],
      },
    );
    expect(story).toMatchObject({
      args: { text: "from the file", loud: true, width: 20 },
      parameters: {
        rows: 4,
        docs: { page: "one", theme: "dark", note: "two" },
      },
      decorators: [inner, outer, outermost],
      loaders: [fromPreview, fromFile, fromStory],
      tags: ["test", "themed", "slow"],
    });
  });

  it("draws the file's component with the args when nothing else is said", () => {
    const story = prepareStory(meta, "Default", {});
    expect(story.render({ text: "hi" }, {} as never)).toEqual(
      <Label text="hi" />,
    );
  });

  it("prefers the story's render to the file's, and the file's to the component", () => {
    const fromFile = () => "the file's";
    const fromStory = () => "the story's";
    const withRender = { ...meta, render: fromFile };
    expect(prepareStory(withRender, "A", {}).render).toBe(fromFile);
    expect(prepareStory(withRender, "B", { render: fromStory }).render).toBe(
      fromStory,
    );
  });

  it("takes the file's play when the story has none", () => {
    const play = () => {};
    expect(prepareStory({ ...meta, play }, "A", {}).play).toBe(play);
  });

  it("reads a story written as a function: it draws, and carries the rest as properties", () => {
    const Template = (args: { text: string }) => <Label {...args} />;
    const exported = Object.assign(Template.bind({}), {
      args: { text: "bound" },
      tags: ["!dev"],
    });
    const story = prepareStory(meta, "Bound", exported);
    expect(story.render).toBe(exported);
    expect(story.args).toEqual({ text: "bound", loud: true });
    expect(story.tags).toEqual(["test", "slow"]);
  });

  it("refuses an export that is neither form, naming it", () => {
    expect(() => prepareStory(meta, "limit", 3)).toThrow(
      "limit, exported beside the stories of fixtures/Label, is neither a story object nor a function. Every named export of a stories file is a story.",
    );
    expect(() => prepareStory(meta, "nothing", null)).toThrow(
      "nothing, exported beside the stories",
    );
  });

  it("refuses a story with nothing to draw", () => {
    expect(() =>
      prepareStory({ title: "fixtures/Bare" }, "Default", {}),
    ).toThrow(
      "The story Default of fixtures/Bare has nothing to draw: give it a render, or its file a component.",
    );
  });
});
