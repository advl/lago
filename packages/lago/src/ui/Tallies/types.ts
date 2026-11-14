import type { Status } from "../../catalog/index.js";

/** Props for the Tallies component. */
export interface TalliesProps {
  /** How many pictures have each status. */
  tallies: Readonly<Record<Status, number>>;
  /** How many stories files failed to load. */
  failures: number;
  /** The width of the pane, in display cells. */
  width: number;
}
