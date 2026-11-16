import type { Globals, PreparedStory } from "./types.js";

/**
 * The value of every global a story is drawn with: the story's own when it
 * fixes one, else the mode's, else the global's default. A story drawn in no
 * mode is given none.
 */
export default function resolveGlobals(
  { globalTypes, globals }: Pick<PreparedStory, "globalTypes" | "globals">,
  mode: Globals = {},
): Globals {
  const defaults = Object.fromEntries(
    Object.entries(globalTypes).map(([name, { default: value }]) => [
      name,
      value,
    ]),
  );
  return { ...defaults, ...mode, ...globals };
}
