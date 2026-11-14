import { createElement } from "react";
import mergeParameters from "./mergeParameters.js";
import resolveTags from "./resolveTags.js";
import type { Annotations, Meta, PreparedStory } from "./types.js";

type Story = Annotations<Record<string, unknown>>;

/**
 * What a story's export says, in either form the format allows: an object, or
 * a function that draws the story and carries the rest as its properties,
 * which is what a bound template is.
 */
function readAnnotations(
  title: string,
  name: string,
  exported: unknown,
): Story {
  if (typeof exported === "function") {
    return { ...(exported as Story), render: exported as Story["render"] };
  }
  if (typeof exported === "object" && exported !== null) return exported;
  throw new Error(
    `${name}, exported beside the stories of ${title}, is neither a story object nor a function. Every named export of a stories file is a story.`,
  );
}

/**
 * A story with what its file's default export gives it: args merged key by
 * key, parameters object into object, the story's decorators inside the
 * file's, and the story's own `render` and `play` before the file's.
 */
export default function prepareStory(
  meta: Meta,
  name: string,
  exported: unknown,
): PreparedStory {
  const story = readAnnotations(meta.title, name, exported);
  const { component } = meta;
  const render =
    story.render ??
    meta.render ??
    (component && ((args) => createElement(component, args)));
  if (!render) {
    throw new Error(
      `The story ${name} of ${meta.title} has nothing to draw: give it a render, or its file a component.`,
    );
  }
  return {
    title: meta.title,
    name,
    args: { ...meta.args, ...story.args },
    parameters: mergeParameters(meta.parameters, story.parameters),
    decorators: [...(story.decorators ?? []), ...(meta.decorators ?? [])],
    render,
    play: story.play ?? meta.play,
    tags: resolveTags(meta.tags, story.tags),
  };
}
