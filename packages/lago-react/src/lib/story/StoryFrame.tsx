import { useTerminalDimensions } from "@opentui/react";
import { type ReactNode, useMemo, useRef } from "react";
import type { PreparedStory } from "./types.js";

interface Props {
  readonly story: PreparedStory;
  readonly args: Record<string, unknown>;
}

/**
 * A story drawn: its `render` inside its decorators, each given the story's
 * context with the size of the screen it is on, so a component that takes
 * its width as a prop can be given the screen's.
 */
export default function StoryFrame({ story, args }: Props) {
  const { width, height } = useTerminalDimensions();
  // The args are read when the story draws, not built into the component:
  // a component made anew would be mounted anew, and lose its state, each
  // time a parent drew the story with args of the same value.
  const latest = useRef(args);
  latest.current = args;
  const Decorated = useMemo(() => {
    const viewport = { cols: width, rows: height };
    const readContext = () => ({
      title: story.title,
      name: story.name,
      args: latest.current,
      parameters: story.parameters,
      viewport,
    });
    return story.decorators.reduce<() => ReactNode>(
      (Story, decorate) => () => decorate(Story, readContext()),
      () => story.render(latest.current, readContext()),
    );
  }, [story, width, height]);
  return <Decorated />;
}
