import type { GalleryState } from "../../state/index.js";

/** What Esc does now, in words; absent when there is nothing to come out of. */
export default function describeBack(state: GalleryState): string | undefined {
  // Each says something no other key says, as the key bar tells them apart
  // by what they do.
  if (state.help) return "leave the help";
  if (state.confirming) return "keep the golden as it is";
  if (state.filtering) return "clear the filter";
  if (state.searching) return "cancel the search";
  if (state.cell) return "put the cursor away";
  if (state.difference) return "back to the picture";
  if (state.inspecting) return "back to the stories";
  if (state.focus === "stories") return "back to the tree";
  return undefined;
}
