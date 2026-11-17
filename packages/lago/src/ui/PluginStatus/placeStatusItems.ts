import { fitField, measureText } from "@aztlan/tui";
import type { PluginSelection, StatusItem } from "../../plugins/index.js";
import { itemSeparator, itemShare } from "./constants.js";
import type { PlacedItem, PlacedItems } from "./types.js";

/** One item as it would be placed in `room` columns: a text fitted and measured, or a component at its columns. */
const placeItem = (
  item: StatusItem,
  selection: PluginSelection,
  room: number,
): PlacedItem => {
  if ("text" in item) {
    const text = fitField(
      { text: item.text(selection), kind: "words" },
      "line",
      room,
    );
    return { text, columns: measureText(text) };
  }
  return { component: item.component, columns: item.columns };
};

/**
 * The items that fit at the end of a status line `width` columns wide,
 * each after a separator: a text at its measure, a component at the
 * columns it asks for. Together they take no more than their share of the
 * line; the first that would pass it, and every one after, is left out.
 */
export default function placeStatusItems(
  items: readonly StatusItem[],
  selection: PluginSelection,
  width: number,
): PlacedItems {
  const room = Math.floor(width * itemShare);
  const separator = measureText(itemSeparator);
  const placed: PlacedItem[] = [];
  let columns = 0;
  for (const item of items) {
    const one = placeItem(item, selection, room);
    if (columns + separator + one.columns > room) break;
    columns += separator + one.columns;
    placed.push(one);
  }
  return { items: placed, columns };
}
