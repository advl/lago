import type { CatalogComponent } from "../catalog/index.js";
import type { MatrixRow } from "./types.js";

/** The matrix's rows: every story of each component, in the order the tree shows them. */
export default function listRows(
  components: readonly CatalogComponent[],
): MatrixRow[] {
  return components.flatMap((component) =>
    component.stories.map((story, place) => ({ component, story, place })),
  );
}
