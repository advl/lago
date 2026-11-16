import { type ReactNode, useContext, useMemo, useRef } from "react";
import { ViewportContext } from "../render/index.js";
import type { PreparedStory } from "./types.js";

interface Props {
  readonly story: PreparedStory;
  readonly args: Record<string, unknown>;
  /** What the story's loaders gave, run before it was mounted. */
  readonly loaded: Readonly<Record<string, unknown>>;
}

const refuseUnmounted = (title: string, name: string): never => {
  throw new Error(
    `The story "${title} ${name}" was drawn outside render, which gives it the size of its screen. Mount it with render, or run it with its run().`,
  );
};

/**
 * A story drawn: its `render` inside its decorators, each given the story's
 * context with the size of the screen it is on, so a component that takes
 * its width as a prop can be given the screen's. The size is the one the
 * story was mounted at, which `render` gives; a story mounted any other way
 * has no screen to be told of, and is refused.
 */
export default function StoryFrame({ story, args, loaded }: Props) {
  const viewport =
    useContext(ViewportContext) ?? refuseUnmounted(story.title, story.name);
  // The args are read when the story draws, not built into the component:
  // a component made anew would be mounted anew, and lose its state, each
  // time a parent drew the story with args of the same value.
  const latest = useRef(args);
  latest.current = args;
  const Decorated = useMemo(() => {
    const readContext = () => ({
      title: story.title,
      name: story.name,
      args: latest.current,
      parameters: story.parameters,
      viewport,
      loaded,
    });
    return story.decorators.reduce<() => ReactNode>(
      (Story, decorate) => () => decorate(Story, readContext()),
      () => story.render(latest.current, readContext()),
    );
  }, [story, viewport, loaded]);
  return <Decorated />;
}
