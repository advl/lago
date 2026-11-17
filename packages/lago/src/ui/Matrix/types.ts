import type { CatalogComponent } from "../../catalog/index.js";
import type { MatrixColumn } from "../../state/index.js";

/** Props for the Matrix component. */
export interface MatrixProps {
  /** The components whose stories are its rows, in the order the tree shows them. */
  components: readonly CatalogComponent[];
  /** Its columns: each viewport, in the base and then in each mode. */
  columns: readonly MatrixColumn[];
  /** The selected cell: its row's component by title, its story's place there, and its column's place. */
  selected: {
    readonly title: string | undefined;
    readonly story: number;
    readonly column: number;
  };
  /** What the tree is filtered by, which leaves the rows; empty for every story. */
  filter: string;
  /** The first row and column shown when last drawn, from which a move scrolls as little as it can. */
  first: MatrixWindow;
  /** Told the first row and column shown, once drawn, to be given back as `first`. */
  onShown: (first: MatrixWindow) => void;
  /** The region's width, in display cells. */
  width: number;
  /** The region's height, in lines. */
  height: number;
}

/** Where the matrix is scrolled to: the first row and the first column shown. */
export interface MatrixWindow {
  readonly row: number;
  readonly column: number;
}

/** How a cell of the matrix is shown: a glyph, the words it stands for, and the token of its colour. */
export interface Mark {
  readonly glyph: string;
  readonly word: string;
  readonly color:
    | "color.text.success"
    | "color.text.warning"
    | "color.text.error"
    | "color.text.muted";
}
