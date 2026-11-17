import type { Catalog } from "../../catalog/index.js";
import type { GalleryState, Selection } from "../../state/index.js";

/** Props for the StatusLine component. */
export interface StatusLineProps {
  /** Where the reader is, and what is open. */
  state: GalleryState;
  /** What the state selects in the catalog. */
  selection: Selection;
  /** The latest run's catalog; absent while the first run is under way. */
  catalog: Catalog | undefined;
  /** What the gallery last did, until the next key. */
  message: string | undefined;
  /**
   * What the line names after what it says, in order, as the size and the
   * mode shown: `narrow`, `dark`. None leaves the whole line to what is said.
   */
  items?: readonly string[];
  /** The width of the pane, in display cells. */
  width: number;
}
