import type { Field, FitRules, Piece } from "../../fit/index.js";

/**
 * A group's name: a field, fitted by its kind's rule, or a function that
 * gives the name's runs fitted to the cells it is given, for a name drawn in
 * more than one look, such as a mark and the name after it.
 */
export type GroupName = Field | ((room: number) => readonly Piece[]);

/** Props for the GroupHeading component. */
export interface GroupHeadingProps {
  /**
   * The group's name: an owner, a repository, a kind such as `ISSUES`, or
   * in a help the object its keys act on, such as `Mode`.
   * Maps to DSL role: heading text (cardinality: 1)
   */
  name: GroupName;
  /**
   * On the pinned heading only, where the rows shown under it start in the
   * group, and the group's size: `3 of 8`.
   * Maps to DSL role: pinned count (cardinality: 0..1)
   */
  count?: Field;
  /** The width of the region, in display cells. */
  width: number;
  /** The rules the name and the count are fitted by; the base table when absent. */
  rules?: FitRules;
}
