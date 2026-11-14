import type { Screenshot } from "@aztlan/lago-react";
import type { Extent } from "./types.js";

/**
 * The part of a picture that is drawn: from its top left corner to the end
 * of its widest run and its last line that shows anything. A picture that
 * shows nothing takes one cell, so its frame is still drawn.
 */
export default function measurePicture(picture: Screenshot): Extent {
  let cols = 0;
  let rows = 0;
  picture.lines.forEach((runs, line) => {
    const last = runs.at(-1);
    if (last) {
      cols = Math.max(cols, last.x + last.width);
      rows = line + 1;
    }
  });
  return { cols: Math.max(1, cols), rows: Math.max(1, rows) };
}
