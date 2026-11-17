import checkGlobalTypes from "./checkGlobalTypes.js";
import mergePreviews from "./mergePreviews.js";
import projectAnnotations from "./projectAnnotations.js";
import type { Preview } from "./types.js";

/**
 * Gives `composeStories` the project's preview, so that a story composed in a
 * test is drawn as its stories file draws it. A test file that composes
 * stories calls it once, at its top, before it composes. A project with
 * plugins gives their previews first and its own last, in a list, as its
 * stories are set inside them. A preview whose `globalTypes` cannot be drawn
 * with, or a global two of them declare, is refused.
 *
 * @note Impure: sets the preview every later `composeStories` in the test file reads.
 */
export default function setProjectAnnotations(
  preview: Preview | readonly Preview[],
): void {
  const previews: readonly Preview[] = Array.isArray(preview)
    ? preview
    : [preview as Preview];
  const layers = previews.map((each, place) => {
    const which =
      previews.length === 1
        ? "preview given to setProjectAnnotations"
        : `preview ${place + 1} of the ${previews.length} given to setProjectAnnotations`;
    checkGlobalTypes(each.globalTypes, `The ${which}`);
    return { where: `the ${which}`, preview: each };
  });
  projectAnnotations.current = mergePreviews(layers);
}
