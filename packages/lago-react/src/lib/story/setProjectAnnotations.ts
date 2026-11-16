import projectAnnotations from "./projectAnnotations.js";
import type { Preview } from "./types.js";

/**
 * Gives `composeStories` the project's preview, so that a story composed in a
 * test is drawn as its stories file draws it. A test file that composes
 * stories calls it once, at its top, before it composes.
 *
 * @note Impure: sets the preview every later `composeStories` in the test file reads.
 */
export default function setProjectAnnotations(preview: Preview): void {
  projectAnnotations.current = preview;
}
