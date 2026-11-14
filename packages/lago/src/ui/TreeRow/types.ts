import type { CatalogComponent } from "../../catalog/index.js";

/** Props for the TreeRow component. */
export interface TreeRowProps {
  /** The component the row names. */
  component: CatalogComponent;
  /** Whether it is the selected component. */
  selected: boolean;
  /** The width of the tree, in display cells. */
  width: number;
}
