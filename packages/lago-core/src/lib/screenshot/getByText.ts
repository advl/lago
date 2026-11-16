import formatPicture from "./formatPicture.js";
import readLines from "./readLines.js";
import type { Run, Screenshot } from "./types.js";

/**
 * The first run that contains `text`, reading down the screen and along each
 * line. Throws, showing the screen, when no run does: either the text is not
 * there, or its style changes part way and so no one run holds it.
 */
export default function getByText(screenshot: Screenshot, text: string): Run {
  for (const runs of screenshot.lines) {
    const found = runs.find((run) => run.text.includes(text));
    if (found) return found;
  }
  const quoted = JSON.stringify(text);
  const row = readLines(screenshot).findIndex((line) => line.includes(text));
  const reason =
    row === -1
      ? `No text on the screen contains ${quoted}.`
      : `${quoted} is on line ${row + 1}, but its style changes part way, so no one run holds it. Ask for a part drawn in one style.`;
  throw new Error(
    [reason, "The screen shows:", ...formatPicture(screenshot)].join("\n"),
  );
}
