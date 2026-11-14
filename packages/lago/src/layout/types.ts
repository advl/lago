/** How a component's stories sit in the region: two to a row, or one with its description. */
export type Arrangement = "beside" | "rows";

/** The columns and lines a picture's drawn part takes. */
export interface Extent {
  readonly cols: number;
  readonly rows: number;
}

/** One block of the stories list: one or two stories side by side, and the lines it takes. */
export interface StoryBlock<Story> {
  readonly key: string;
  /** The stories it holds, in the component's order. */
  readonly stories: readonly Story[];
  readonly lines: number;
  /** In rows, the description's lines beside or under the picture. */
  readonly description: readonly string[];
  /** Whether the description sits under the picture, for want of room beside it. */
  readonly under: boolean;
}
