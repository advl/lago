import { createElement } from "react";
import { defaultViewport } from "../render/index.js";
import listStories from "./listStories.js";
import runStory from "./runStory.js";
import StoryFrame from "./StoryFrame.js";
import type {
  ComposedStories,
  ComposedStory,
  PreparedStory,
  StoriesModule,
} from "./types.js";

function composeStory(story: PreparedStory): ComposedStory {
  const Composed = (props: Record<string, unknown>) =>
    createElement(StoryFrame, { story, args: { ...story.args, ...props } });
  return Object.assign(Composed, {
    storyName: story.name,
    args: story.args,
    parameters: story.parameters,
    tags: story.tags,
    run: (viewport = defaultViewport) => runStory(story, viewport),
  });
}

/**
 * The stories of a stories file, each with everything its file gives it, for
 * a test to use as its fixtures: `import * as stories` from the file and pass
 * the module. A story is a component to mount with `render`, and `run` mounts
 * it and plays it through.
 */
export default function composeStories<Module extends StoriesModule>(
  module: Module,
): ComposedStories<Module> {
  const stories = listStories(module, "The module given to composeStories");
  const composed = Object.fromEntries(
    stories.map((story) => [story.name, composeStory(story)]),
  );
  // The names are the module's own exports, which only its type knows.
  return composed as unknown as ComposedStories<Module>;
}
