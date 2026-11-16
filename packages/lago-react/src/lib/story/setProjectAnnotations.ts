import checkGlobalTypes from "./checkGlobalTypes.js";
import projectAnnotations from "./projectAnnotations.js";
import type { Preview } from "./types.js";

/**
 * Gives `composeStories` the project's preview, so that a story composed in a
 * test is drawn as its stories file draws it. A test file that composes
 * stories calls it once, at its top, before it composes. A preview whose
 * `globalTypes` cannot be drawn with is refused.
 *
 * @note Impure: sets the preview every later `composeStories` in the test file reads.
 */
export default function setProjectAnnotations(preview: Preview): void {
  checkGlobalTypes(
    preview.globalTypes,
    "The preview given to setProjectAnnotations",
  );
  projectAnnotations.current = preview;
}
