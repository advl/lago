import type { StoryRecord } from "../../catalog/index.js";
import type { Extent } from "../../layout/index.js";

/** One story's frame in the list, as the gallery has worked it out. */
export interface StoryFrame {
  readonly name: string;
  readonly description: string | undefined;
  /** The story's picture at the viewport and in the mode shown; absent where the story is not drawn there. */
  readonly record: StoryRecord | undefined;
  /** What the frame says when there is no picture and no error: why the story is not drawn there. */
  readonly absent: string;
  /** The columns and lines inside the frame. */
  readonly extent: Extent;
  readonly selected: boolean;
  /** Whether the search found its text in this story. */
  readonly matched: boolean;
}

/** Props for the StoryBlock component. */
export interface StoryBlockProps {
  /** The block's stories: one, or two side by side. */
  frames: readonly StoryFrame[];
  /** The description of a story set in rows, wrapped. */
  description: readonly string[];
  /** Whether the description goes under the picture rather than beside it. */
  under: boolean;
}
