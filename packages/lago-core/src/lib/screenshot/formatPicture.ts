import readLines from "./readLines.js";
import type { Screenshot } from "./types.js";

/**
 * The screen for the eye: each line behind a bar that marks where it starts,
 * down to the last line that shows anything.
 */
export default function formatPicture(screenshot: Screenshot): string[] {
  const lines = readLines(screenshot);
  const shown = lines.findLastIndex((line) => line !== "") + 1;
  return lines.slice(0, shown).map((line) => `|${line}`);
}
