import { defaultTags } from "./constants.js";

/**
 * A story's tags: the ones every story starts with, then each layer's in
 * turn, the file's before the story's. A tag written with `!` before it takes
 * that tag away.
 */
export default function resolveTags(
  ...layers: (readonly string[] | undefined)[]
): string[] {
  const tags = new Set(defaultTags);
  for (const tag of layers.flatMap((layer) => layer ?? [])) {
    if (tag.startsWith("!")) tags.delete(tag.slice(1));
    else tags.add(tag);
  }
  return [...tags];
}
