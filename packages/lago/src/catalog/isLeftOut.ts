import type { CatalogStory } from "./types.js";

/** Whether a story's file leaves it out of `mode` at `viewportName`. */
export default function isLeftOut(
  story: CatalogStory | undefined,
  viewportName: string | undefined,
  mode: string | undefined,
): boolean {
  return (
    story?.excluded.some(
      (cell) => cell.viewportName === viewportName && cell.mode === mode,
    ) === true
  );
}
