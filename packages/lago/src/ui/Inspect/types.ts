import type { StoryRecord } from "../../catalog/index.js";
import type { Cell } from "../Picture/types.js";

/** Props for the Inspect component. */
export interface InspectProps {
  /** The story's name. */
  name: string;
  /** The viewport shown, by name. */
  viewportName: string;
  /** The mode shown, by name; none for the base. */
  mode?: string;
  /** Whether the story's file leaves the mode out. */
  leftOut?: boolean;
  /** The story's picture at that viewport in that mode; absent where the story is not drawn there. */
  record: StoryRecord | undefined;
  /** How far what is shown is scrolled, in lines; it is held within what is shown. */
  scroll: number;
  /** Whether the golden is shown over the picture. */
  difference: boolean;
  /** The cell under the cursor, when the cursor is shown; the picture scrolls to keep it in view. */
  cell?: Cell;
  /** The region's width, in display cells. */
  width: number;
  /** The region's height, in lines. */
  height: number;
}

/** What an inspected story shows, and how far it may scroll and its cursor move. */
export interface InspectedView {
  /** The golden over the picture, the picture, or a message: the error thrown, or that it is not drawn. */
  readonly shown: "difference" | "picture" | "message";
  /** The columns and lines inside the frame. */
  readonly room: { readonly cols: number; readonly lines: number };
  /** The columns of the picture drawn: its own, or the room's when it is wider. */
  readonly cols: number;
  /** The message's lines, wrapped to the room, when one is shown. */
  readonly message: readonly string[];
  /** The furthest line it scrolls to. */
  readonly scroll: number;
  /** The furthest cell the cursor reaches. */
  readonly cell: Cell;
}
