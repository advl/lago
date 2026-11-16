import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, ViewportContext } from "../render/index.js";
import prepareStory from "./prepareStory.js";
import StoryFrame from "./StoryFrame.js";
import type { StoryContext } from "./types.js";

const story = prepareStory({ title: "frame/Sized" }, "Sized", {
  render: (_args: unknown, { viewport }: StoryContext) => (
    <text>{`${viewport.cols} by ${viewport.rows}`}</text>
  ),
});

describe("StoryFrame", () => {
  it("draws a story at the size of the screen it is mounted on", async () => {
    const screen = await render(
      <StoryFrame story={story} args={{}} loaded={{}} />,
      {
        cols: 14,
        rows: 2,
      },
    );
    expect(screen.lines.at(0)).toBe("14 by 2");
  });

  it("refuses a story mounted where no screen gives it a size, naming it", async () => {
    await expect(
      render(
        createElement(
          ViewportContext.Provider,
          { value: undefined },
          <StoryFrame story={story} args={{}} loaded={{}} />,
        ),
      ),
    ).rejects.toThrow(
      'The story "frame/Sized Sized" was drawn outside render, which gives it the size of its screen.',
    );
  });
});
