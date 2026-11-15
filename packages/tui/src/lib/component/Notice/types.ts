/** Props for the Notice component. */
export interface NoticeProps {
  /**
   * What is wrong, such as `git is not installed`. The notice
   * opens it with `✗`.
   * Maps to DSL role: reason (cardinality: 1)
   */
  reason: string;
  /**
   * What to do about it, such as `run git init`. The notice opens it
   * with `Recovery:`.
   * Maps to DSL role: recovery line (cardinality: 1)
   */
  recovery: string;
  /** The width of the pane, in display cells. */
  width: number;
}
