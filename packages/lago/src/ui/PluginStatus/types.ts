import type { PluginSelection, StatusItem } from "../../plugins/index.js";

/** An item of the status line, placed: its text fitted, or its component, and the columns it takes. */
export type PlacedItem =
  | { readonly text: string; readonly columns: number }
  | {
      readonly component: Extract<
        StatusItem,
        { component: unknown }
      >["component"];
      readonly columns: number;
    };

/** The items that fit at the end of the status line, and every column they take, separators included. */
export interface PlacedItems {
  readonly items: readonly PlacedItem[];
  readonly columns: number;
}

/** Props for the PluginStatus component. */
export interface PluginStatusProps {
  /** The items, as `placeStatusItems` placed them. */
  placed: PlacedItems;
  /** What the reader has selected, which each component is given. */
  selection: PluginSelection;
}
