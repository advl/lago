/** Where a search found its text in a component's stories. */
export interface Hit {
  /** The place of the story among the component's. */
  readonly story: number;
  readonly field: "name" | "description" | "picture";
  /** In a picture, the line, counted from 0. */
  readonly line?: number;
}
