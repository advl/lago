import type { Screenshot } from "@aztlan/lago-react";

/** Props for the Difference component. */
export interface DifferenceProps {
  /** The picture the golden holds. */
  expected: Screenshot;
  /** The picture the story draws now. */
  actual: Screenshot;
  /** The first of the difference's lines shown, counted from 0. */
  from: number;
  /** How many lines it is shown in. */
  lines: number;
  /** The columns it is shown in. */
  cols: number;
}

/** A line where a picture and its golden differ. */
export interface DifferingLine {
  /** The line, counted from 0. */
  readonly line: number;
  readonly expected: string;
  readonly actual: string;
  /** Whether their text differs, or only their colours or attributes. */
  readonly kind: "text" | "style";
}
