import { frameCells, gutter } from "./constants.js";
import type { Arrangement, Extent } from "./types.js";

/**
 * How a component's stories sit in a region `room` columns wide: two to a
 * row when the two widest pictures fit beside each other in their frames,
 * which compares them at a glance, and otherwise one to a row with its
 * description.
 */
export default function chooseArrangement(
  extents: readonly Extent[],
  room: number,
): Arrangement {
  const [first = 0, second = 0] = extents
    .map(({ cols }) => cols + frameCells.cols)
    .sort((one, other) => other - one);
  return extents.length > 1 && first + gutter + second <= room
    ? "beside"
    : "rows";
}
