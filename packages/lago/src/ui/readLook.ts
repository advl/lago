import type { StoryRecord } from "../catalog/index.js";
import { comparisonLooks, statusLooks } from "./constants.js";

/**
 * How a picture is shown: as equal where the mode expected a change, as an
 * error, as equal to the base, or by its status, in that order.
 */
export default function readLook(record: StoryRecord) {
  if (record.comparison === "unreached") return comparisonLooks.unreached;
  if (record.status === "error") return statusLooks.error;
  if (record.comparison === "equal") return comparisonLooks.equal;
  return statusLooks[record.status];
}
