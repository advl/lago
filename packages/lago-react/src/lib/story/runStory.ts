import { type Screen, stoppedTimers, type Viewport } from "@aztlan/lago-core";
import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import { render } from "../render/index.js";
import StoryFrame from "./StoryFrame.js";
import type { PreparedStory } from "./types.js";

/**
 * Mounts a story on a screen of the given size, with time stopped at zero,
 * runs its `play`, and gives the screen as the story leaves it. A test that
 * has already faked the timers keeps its own clock.
 *
 * @note Impure: fakes the timers until the test ends, and mounts on a renderer, as `render` does.
 */
export default async function runStory(
  story: PreparedStory,
  viewport: Viewport,
): Promise<Screen> {
  if (!vi.isFakeTimers()) {
    vi.useFakeTimers({ now: 0, toFake: [...stoppedTimers] });
    onTestFinished(() => {
      vi.useRealTimers();
    });
  }
  const { title, name, args, parameters } = story;
  const screen = await render(
    createElement(StoryFrame, { story, args }),
    viewport,
  );
  if (story.play) {
    await story.play({
      title,
      name,
      args,
      parameters,
      viewport,
      canvas: screen,
      userEvent: screen.userEvent,
    });
    await screen.settle();
  }
  return screen;
}
