import type { Screenshot } from "@aztlan/lago-react";
import type { Cell } from "../Picture/types.js";

/** Props for the RunReader component. */
export interface RunReaderProps {
  /** The picture the cursor is on. */
  picture: Screenshot;
  /** The cell under the cursor. */
  cell: Cell;
  /** The width of the pane, in display cells. */
  width: number;
}
