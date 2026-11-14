import type { Attribute, Color, Screenshot } from "@aztlan/lago-react";

/** A cell of a picture, by its column and line, counted from 0. */
export interface Cell {
  readonly x: number;
  readonly y: number;
}

/** Props for the Picture component. */
export interface PictureProps {
  /** The picture a story drew. */
  picture: Screenshot;
  /** The first of the picture's lines drawn, counted from 0; the first when absent. */
  from?: number;
  /** How many of its lines are drawn. */
  lines: number;
  /** The columns it is drawn in; what lies past them is cut. */
  cols: number;
  /** The cell drawn inverted, as the cursor that reads it. */
  cell?: Cell;
}

/** A piece of one of a picture's lines as it is drawn again: a run, a part of one, or the gap before one. */
export interface DrawnPiece {
  readonly x: number;
  readonly text: string;
  readonly fg: Color;
  readonly bg: Color;
  readonly attributes: readonly Attribute[];
  /** Whether the cursor is on it. */
  readonly cursor: boolean;
}
