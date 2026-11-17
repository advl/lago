import { type Catalog, findPicture } from "../catalog/index.js";
import { filterComponents, findHits } from "../search/index.js";
import type { GalleryState, Selection } from "./types.js";

/**
 * What `state` selects in `catalog`: the components the filter leaves, the
 * selected one, or the first when it is gone, its story, held within its
 * stories, the viewport, the story's picture there, where the search is
 * found, and the picture asked to be accepted while it is still selected
 * and still draws what it drew when asked.
 */
export default function readSelection(
  state: GalleryState,
  catalog: Catalog,
): Selection {
  const components = filterComponents(catalog, state.filter);
  const component =
    components.find(({ title }) => title === state.title) ?? components.at(0);
  const last = Math.max(0, (component?.stories.length ?? 0) - 1);
  const viewportName = catalog.viewports.at(
    Math.min(state.viewport, catalog.viewports.length - 1),
  );
  const story = Math.min(state.story, last);
  const record = findPicture(
    component?.stories.at(story),
    viewportName,
    undefined,
  );
  const hits =
    component && viewportName
      ? findHits(component, viewportName, state.search)
      : [];
  const asked = state.confirming;
  return {
    components,
    component,
    story,
    viewportName,
    record,
    hits,
    hit: Math.min(state.hit, Math.max(0, hits.length - 1)),
    confirming:
      record &&
      asked?.title === record.title &&
      asked.story === record.name &&
      asked.viewportName === record.viewportName &&
      asked.text === record.text
        ? record
        : undefined,
  };
}
