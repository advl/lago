import type { Loader, StoryContext } from "./types.js";

/**
 * Runs a story's loaders one after another, each once the one before it has
 * finished, so a loader may read what an earlier one set up, and merges what
 * each gives in that order: a later loader's value wins under the same name.
 *
 * @note Impure: a loader may do anything, such as fetch or seed a store.
 */
export default async function runLoaders(
  loaders: readonly Loader[],
  context: Omit<StoryContext, "loaded">,
): Promise<Readonly<Record<string, unknown>>> {
  const loaded: Record<string, unknown> = {};
  for (const load of loaders) {
    // Each waits for the one before it: a loader that only sets something up
    // gives nothing, and the loaders after it read what it set up.
    Object.assign(loaded, await load(context));
  }
  return loaded;
}
