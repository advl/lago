import type { Status } from "./types.js";

/** How bad each state is: a component shows the worst of its stories. */
export const statusRank: Readonly<Record<Status, number>> = {
  pass: 0,
  new: 1,
  changed: 2,
  error: 3,
};
