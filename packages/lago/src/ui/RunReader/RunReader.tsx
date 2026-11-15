import { fitField, tokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import describeCell from "./describeCell.js";
import type { RunReaderProps } from "./types.js";

/** The status line while the cursor reads a picture: what is drawn under it, in words. */
const RunReader = ({ picture, cell, width }: RunReaderProps): ReactNode => (
  <text fg={tokens["color.text"]}>
    {fitField(
      { text: describeCell(picture, cell), kind: "quote" },
      "line",
      width,
    )}
  </text>
);

export default RunReader;
