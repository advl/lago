import type { CatalogComponent } from "../catalog/index.js";
import readLines from "./readLines.js";
import type { Hit } from "./types.js";

/**
 * Every place `query` appears, ignoring case, in a component's stories at
 * one viewport: in a story's name, its description, and each line of the
 * text its picture draws, in the stories' order. Nothing for an empty query.
 */
export default function findHits(
  component: CatalogComponent,
  viewportName: string,
  query: string,
): Hit[] {
  if (query === "") return [];
  const asked = query.toLowerCase();
  const holds = (text: string | undefined) =>
    text?.toLowerCase().includes(asked) ?? false;
  return component.stories.flatMap((story, place): Hit[] => {
    const picture = story.pictures.find(
      (each) => each.viewportName === viewportName,
    )?.actual;
    const lines = picture ? readLines(picture) : [];
    return [
      ...(holds(story.name) ? [{ story: place, field: "name" as const }] : []),
      ...(holds(story.description)
        ? [{ story: place, field: "description" as const }]
        : []),
      ...lines.flatMap((text, line) =>
        holds(text) ? [{ story: place, field: "picture" as const, line }] : [],
      ),
    ];
  });
}
