import { statusRank } from "./constants.js";
import type { Status } from "./types.js";

/** The worst of `statuses`, or `pass` when there are none. */
export default function findWorst(statuses: readonly Status[]): Status {
  return statuses.reduce<Status>(
    (worst, each) => (statusRank[each] > statusRank[worst] ? each : worst),
    "pass",
  );
}
