import { type Screen, stoppedTimers, type Viewport } from "@aztlan/lago-core";
import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import { render } from "../render/index.js";
import runLoaders from "./runLoaders.js";
import StoryFrame from "./StoryFrame.js";
import type { PreparedStory } from "./types.js";

/**
 * Mounts a story on a screen of the given size, with time stopped at zero,
 * runs its `play`, and gives the screen as the story leaves it. Its loaders
 * run first, on the stopped clock, and what they give is in the context of
 * everything that draws or plays the story. A test that has already faked
 * the timers keeps its own clock. A test that ends while the loaders still
 * run fails with an error saying why they may never finish.
 *
 * @note Impure: fakes the timers until the test ends, runs the loaders, and mounts on a renderer, as `render` does.
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
  // A loader that waits on a timer never finishes, since the clock stands
  // still, and the test would only say it timed out; this says why.
  let loading = true;
  onTestFinished(() => {
    if (loading) {
      throw new Error(
        `The story "${title} ${name}" was still running its loaders when its test ended. Loaders run on the stopped clock, where no timer fires, so a loader that waits on one, as a delay does, never finishes: give it what it waits for at once.`,
      );
    }
  });
  const loaded = await runLoaders(story.loaders, {
    title,
    name,
    args,
    parameters,
    viewport,
  }).finally(() => {
    loading = false;
  });
  const screen = await render(
    createElement(StoryFrame, { story, args, loaded }),
    viewport,
  );
  if (story.play) {
    await story.play({
      title,
      name,
      args,
      parameters,
      viewport,
      loaded,
      canvas: screen,
      userEvent: screen.userEvent,
    });
    await screen.settle();
  }
  return screen;
}
