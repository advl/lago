import { defaultViewport } from "@aztlan/lago-core";
import { createElement } from "react";
import listStories from "./listStories.js";
import runLoaders from "./runLoaders.js";
import runStory from "./runStory.js";
import StoryFrame from "./StoryFrame.js";
import type {
  ComposedStories,
  ComposedStory,
  PreparedStory,
  StoriesModule,
} from "./types.js";

/** Nothing loaded, for a story that has no loaders. */
const nothingLoaded: Readonly<Record<string, unknown>> = {};

function composeStory(story: PreparedStory): ComposedStory {
  const { title, name, args, parameters, loaders } = story;
  // What the loaders last gave. A component draws at once, and loaders are
  // awaited before the first draw, so a story with loaders has nothing to
  // draw with until `load` has run them.
  let loaded = loaders.length === 0 ? nothingLoaded : undefined;
  const Composed = (props: Record<string, unknown>) => {
    if (loaded === undefined) {
      throw new Error(
        `The story "${title} ${name}" has loaders, which run before it is first drawn: await its load() before mounting it, or run it whole with its run().`,
      );
    }
    return createElement(StoryFrame, {
      story,
      args: { ...args, ...props },
      loaded,
    });
  };
  return Object.assign(Composed, {
    storyName: name,
    args,
    parameters,
    tags: story.tags,
    load: async (viewport = defaultViewport) => {
      loaded = await runLoaders(loaders, {
        title,
        name,
        args,
        parameters,
        viewport,
      });
    },
    run: (viewport = defaultViewport) => runStory(story, viewport),
  });
}

/**
 * The stories of a stories file, each with everything its file gives it, for
 * a test to use as its fixtures: `import * as stories` from the file and pass
 * the module. A story is a component to mount with `render`, once `load` has
 * run its loaders if it has any, and `run` mounts it and plays it through.
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
