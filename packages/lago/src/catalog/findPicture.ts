import type { CatalogStory, StoryRecord } from "./types.js";

/** A story's picture at `viewportName` in `mode`, the base when it is none; nothing where it was not drawn. */
export default function findPicture(
  story: CatalogStory | undefined,
  viewportName: string | undefined,
  mode: string | undefined,
): StoryRecord | undefined {
  return story?.pictures.find(
    (picture) => picture.viewportName === viewportName && picture.mode === mode,
  );
}
