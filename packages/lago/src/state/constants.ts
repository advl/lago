import type { GalleryState } from "./types.js";

/** The gallery as it opens: on the tree, at the first component. */
export const openingState: GalleryState = {
  focus: "tree",
  title: undefined,
  story: 0,
  viewport: 0,
  arrangement: "auto",
  inspecting: false,
  scroll: 0,
  difference: false,
  cell: undefined,
  filter: "",
  filtering: false,
  search: "",
  searching: false,
  hit: 0,
  confirming: undefined,
  help: false,
};

/** The arrangement the reader steps to from each, round. */
export const nextArrangement = {
  auto: "rows",
  rows: "beside",
  beside: "auto",
} as const satisfies Record<
  GalleryState["arrangement"],
  GalleryState["arrangement"]
>;
