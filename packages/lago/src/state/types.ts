import type { CatalogComponent, StoryRecord } from "../catalog/index.js";
import type { Arrangement } from "../layout/index.js";
import type { Hit } from "../search/index.js";

/** Where the reader is in the gallery, and what is open. */
export interface GalleryState {
  /** The tree of components, or the selected component's stories. */
  readonly focus: "tree" | "stories";
  /** The selected component, by its title, which survives a run that reorders them. */
  readonly title: string | undefined;
  /** The selected story's place among its component's. */
  readonly story: number;
  /** The viewport shown, as its place among the catalog's. */
  readonly viewport: number;
  /** How the stories sit: as the room decides, or as the reader chose. */
  readonly arrangement: "auto" | Arrangement;
  /** Whether the selected story is open on its own, at its whole size. */
  readonly inspecting: boolean;
  /** How far an inspected picture is scrolled, in lines. */
  readonly scroll: number;
  /** Whether an inspected story shows its golden over its picture. */
  readonly difference: boolean;
  /** The cell an inspected picture's cursor is on, when it is shown. */
  readonly cell: { readonly x: number; readonly y: number } | undefined;
  /** What the tree is filtered by, and whether it is being typed. */
  readonly filter: string;
  readonly filtering: boolean;
  /** What the stories are searched for, whether it is being typed, and which hit is current. */
  readonly search: string;
  readonly searching: boolean;
  readonly hit: number;
  /**
   * The picture the gallery asks to confirm accepting, by its component,
   * story and viewport, so a run that changes the selection cannot turn
   * the answer to another picture.
   */
  readonly confirming: PictureKey | undefined;
  readonly help: boolean;
}

/**
 * A picture, by what names it, its component's title, its story's name and
 * its viewport, and by what it draws, so a run that draws it otherwise is
 * told apart.
 */
export interface PictureKey {
  readonly title: string;
  readonly story: string;
  readonly viewportName: string;
  readonly text: string | undefined;
}

/** What the reader does. */
export type GalleryAction =
  /**
   * Up or down: a component, a story, an inspected picture's lines, or its
   * cursor. `limit` is the last line the scroll or the cursor may reach,
   * which only the screen knows; without it they have no end.
   */
  | { readonly type: "move"; readonly by: number; readonly limit?: number }
  /** Left or right: a story beside another, or an inspected picture's cursor, up to the column `limit`. */
  | {
      readonly type: "moveAcross";
      readonly by: number;
      readonly limit?: number;
    }
  /** In: from the tree to the stories, and from a story to it inspected. */
  | { readonly type: "open" }
  /** Out, one step: what is being typed, the cursor, the difference, the inspected story, the stories. */
  | { readonly type: "back" }
  | { readonly type: "nextViewport" }
  | { readonly type: "nextArrangement" }
  | { readonly type: "startFilter" }
  | { readonly type: "startSearch" }
  /** Text typed into the filter or the search, whichever is being typed. */
  | { readonly type: "type"; readonly text: string }
  | { readonly type: "erase" }
  /** Ends typing and keeps what was typed. */
  | { readonly type: "finish" }
  | { readonly type: "nextHit"; readonly by: number }
  | { readonly type: "toggleDifference" }
  | { readonly type: "toggleCell" }
  | { readonly type: "askAccept" }
  | { readonly type: "cancel" }
  | { readonly type: "toggleHelp" };

/** What the state selects in a catalog, read anew after every run. */
export interface Selection {
  /** The components the tree shows, as the filter leaves them. */
  readonly components: readonly CatalogComponent[];
  readonly component: CatalogComponent | undefined;
  /** The selected story's place, within the component's stories. */
  readonly story: number;
  /** The viewport shown, by name. */
  readonly viewportName: string | undefined;
  /** The selected story's picture at the viewport shown; absent where it is not drawn there. */
  readonly record: StoryRecord | undefined;
  /** Where the search was found, in the stories' order. */
  readonly hits: readonly Hit[];
  /** The current hit's place among them, held within them. */
  readonly hit: number;
  /** The picture the gallery asks to confirm accepting, while it is still the selected one. */
  readonly confirming: StoryRecord | undefined;
}
